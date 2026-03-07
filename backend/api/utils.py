from django.utils import timezone
from django.db import models
from datetime import timedelta
from .models import Order, OrderItem


def get_order_statistics(date=None):
    """
    Get order statistics for a specific date or today
    """
    if date is None:
        date = timezone.now().date()
    
    orders = Order.objects.filter(
        created_at__date=date,
        status='completed'
    )
    
    total_orders = orders.count()
    total_revenue = orders.aggregate(
        total=models.Sum('total_amount')
    )['total'] or 0
    
    cash_revenue = orders.filter(
        payment_type='cash'
    ).aggregate(total=models.Sum('total_amount'))['total'] or 0
    
    card_revenue = orders.filter(
        payment_type='card'
    ).aggregate(total=models.Sum('total_amount'))['total'] or 0
    
    avg_preparation_time = None
    completed_orders_with_time = orders.exclude(
        preparation_started_at__isnull=True
    ).exclude(ready_at__isnull=True)
    
    if completed_orders_with_time.exists():
        total_time = timedelta()
        for order in completed_orders_with_time:
            total_time += order.get_preparation_time()
        avg_preparation_time = total_time / completed_orders_with_time.count()
    
    return {
        'date': date,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'cash_revenue': cash_revenue,
        'card_revenue': card_revenue,
        'avg_preparation_time': avg_preparation_time
    }


def get_popular_products(days=7):
    """
    Get most popular products in the last N days
    """
    from django.db.models import Count, Sum
    
    start_date = timezone.now() - timedelta(days=days)
    
    products = OrderItem.objects.filter(
        order__created_at__gte=start_date,
        order__status='completed'
    ).values('product__name').annotate(
        total_quantity=Sum('quantity'),
        order_count=Count('order', distinct=True)
    ).order_by('-total_quantity')[:10]
    
    return list(products)
