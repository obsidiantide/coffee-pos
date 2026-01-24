from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncDate, Coalesce
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Category, Product, Extra, Order, OrderItem, Shift, Expense
from .serializers import (
    CategorySerializer, ProductSerializer, ExtraSerializer,
    OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer,
    ProductCreateUpdateSerializer, CategoryCreateUpdateSerializer,
    ExtraCreateUpdateSerializer, ShiftSerializer, ShiftCreateSerializer,
    ShiftCloseSerializer, ExpenseSerializer, ExpenseCreateSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        if self.request.user and getattr(self.request.user, 'role', None) == 'admin':
            return Category.objects.all()
        return Category.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CategoryCreateUpdateSerializer
        return CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user and getattr(self.request.user, 'role', None) == 'admin':
            queryset = Product.objects.all().select_related('category')
        else:
            queryset = Product.objects.filter(is_active=True).select_related('category')
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


class ExtraViewSet(viewsets.ModelViewSet):
    serializer_class = ExtraSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExtraCreateUpdateSerializer
        return ExtraSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user and getattr(self.request.user, 'role', None) == 'admin':
            return Extra.objects.all()
        return Extra.objects.filter(is_active=True)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all().select_related('user').prefetch_related('items__product', 'items__extras__extra')
        return Order.objects.filter(user=user).select_related('user').prefetch_related('items__product', 'items__extras__extra')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        order = self.get_object()
        if request.user.role == 'admin' or order.user == request.user:
            order.status = 'completed'
            order.calculate_total()
            order.save(update_fields=['status', 'updated_at', 'total_amount'])
            return Response(OrderSerializer(order).data)
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def todays_orders(request):
    today = timezone.now().date()
    qs = Order.objects.filter(created_at__date=today).select_related('user').prefetch_related('items__product', 'items__extras__extra')
    if getattr(request.user, 'role', None) == 'barista':
        qs = qs.filter(user=request.user)
    serializer = OrderSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def sales_report(request):
    days = int(request.query_params.get('days', 7))
    start_date = timezone.now().date() - timedelta(days=days)

    orders = Order.objects.filter(
        created_at__date__gte=start_date,
        status='completed'
    )

    daily_sales = orders.annotate(day=TruncDate('created_at')).values('day').annotate(
        total_orders=Count('id'),
        total_sales=Coalesce(Sum('total_amount'), 0)
    ).order_by('day')

    top_products = OrderItem.objects.filter(
        order__created_at__date__gte=start_date,
        order__status='completed'
    ).values('product__name').annotate(
        total_quantity=Sum('quantity'),
        total_sales=Sum(
            ExpressionWrapper(F('quantity') * F('price_at_time'), output_field=DecimalField(max_digits=12, decimal_places=2))
        )
    ).order_by('-total_quantity')[:10]

    total_orders = orders.count()
    total_sales = orders.aggregate(total=Coalesce(Sum('total_amount'), 0))['total']

    return Response({
        'summary': {
            'total_orders': total_orders,
            'total_sales': total_sales,
            'period_days': days
        },
        'daily_sales': list(daily_sales),
        'top_products': list(top_products)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    today = timezone.now().date()
    today_orders = Order.objects.filter(created_at__date=today)
    completed_today = today_orders.filter(status='completed')
    
    stats = {
        'orders_today': today_orders.count(),
        'completed_today': completed_today.count(),
        'sales_today': completed_today.aggregate(total=Sum('total_amount'))['total'] or 0,
        'pending_orders': Order.objects.filter(status='pending').count(),
        'total_products': Product.objects.filter(is_active=True).count(),
        'active_categories': Category.objects.filter(is_active=True).count(),
    }
    
    return Response(stats)


class ShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Shift.objects.all().select_related('user')
        return Shift.objects.filter(user=user).select_related('user')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ShiftCreateSerializer
        elif self.action == 'close':
            return ShiftCloseSerializer
        return ShiftSerializer
    
    def perform_create(self, serializer):
        active_shift = Shift.objects.filter(user=self.request.user, is_active=True).first()
        if active_shift:
            raise serializers.ValidationError('You already have an active shift')
        
        previous_shift = Shift.objects.filter(user=self.request.user).order_by('-closed_at').first()
        opening_cash = serializer.validated_data.get('opening_cash', 0)
        if previous_shift and previous_shift.closing_cash is not None:
            opening_cash = previous_shift.closing_cash
        
        serializer.save(user=self.request.user, opening_cash=opening_cash)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def close(self, request, pk=None):
        shift = self.get_object()
        if shift.user != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        if not shift.is_active:
            return Response({'detail': 'Shift already closed'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ShiftCloseSerializer(shift, data=request.data, partial=True)
        if serializer.is_valid():
            shift.closed_at = timezone.now()
            shift.is_active = False
            shift.calculate_totals()
            serializer.save()
            return Response(ShiftSerializer(shift).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def active(self, request):
        shift = Shift.objects.filter(user=request.user, is_active=True).first()
        if shift:
            shift.calculate_totals()
            return Response(ShiftSerializer(shift).data)
        return Response({'detail': 'No active shift'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def report(self, request, pk=None):
        shift = self.get_object()
        if shift.user != request.user and request.user.role != 'admin':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        shift.calculate_totals()
        
        cash_remaining = shift.opening_cash + shift.cash_sales - shift.total_expenses - shift.depot_amount
        
        report = {
            'opening_cash': shift.opening_cash,
            'total_sales': shift.total_sales,
            'cash_sales': shift.cash_sales,
            'card_sales': shift.card_sales,
            'total_amount': shift.cash_sales + shift.card_sales,
            'total_expenses': shift.total_expenses,
            'depot_amount': shift.depot_amount,
            'cash_remaining': cash_remaining,
            'closing_cash': shift.closing_cash,
            'opened_at': shift.opened_at,
            'closed_at': shift.closed_at,
        }
        
        return Response(report)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def period_report(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'detail': 'start_date and end_date are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from datetime import datetime
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response({'detail': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
        shifts = Shift.objects.filter(
            opened_at__date__gte=start.date(),
            opened_at__date__lte=end.date()
        ).order_by('opened_at')
        
        if not shifts.exists():
            return Response({
                'total_shifts': 0,
                'total_sales': 0,
                'cash_sales': 0,
                'card_sales': 0,
                'total_expenses': 0,
                'total_depot': 0,
                'opening_cash': 0,
                'closing_cash': 0,
                'net_profit': 0,
            })
        
        # Calculate totals
        total_sales = sum(float(s.total_sales) for s in shifts)
        cash_sales = sum(float(s.cash_sales) for s in shifts)
        card_sales = sum(float(s.card_sales) for s in shifts)
        total_expenses = sum(float(s.total_expenses) for s in shifts)
        total_depot = sum(float(s.depot_amount) for s in shifts)
        
        first_shift = shifts.first()
        last_shift = shifts.last()
        
        opening_cash = float(first_shift.opening_cash)
        closing_cash = float(last_shift.closing_cash) if last_shift.closing_cash else 0
        
        # Net profit = total sales - total expenses
        net_profit = total_sales - total_expenses
        
        report = {
            'total_shifts': shifts.count(),
            'total_sales': total_sales,
            'cash_sales': cash_sales,
            'card_sales': card_sales,
            'total_expenses': total_expenses,
            'total_depot': total_depot,
            'opening_cash': opening_cash,
            'closing_cash': closing_cash,
            'net_profit': net_profit,
        }
        
        return Response(report)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Expense.objects.all().select_related('user', 'shift')
        return Expense.objects.filter(user=user).select_related('user', 'shift')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        active_shift = Shift.objects.filter(user=self.request.user, is_active=True).first()
        serializer.save(user=self.request.user, shift=active_shift)
