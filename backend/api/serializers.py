from rest_framework import serializers
from .models import Category, Product, Extra, Order, OrderItem, OrderItemExtra, Shift, Expense


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extra
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class OrderItemExtraSerializer(serializers.ModelSerializer):
    extra_name = serializers.CharField(source='extra.name', read_only=True)

    class Meta:
        model = OrderItemExtra
        fields = ('id', 'extra', 'extra_name', 'quantity', 'price_at_time')
        read_only_fields = ('price_at_time',)


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    extras = OrderItemExtraSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'size', 'price_at_time', 'extras', 'subtotal')
        read_only_fields = ('price_at_time',)

    def get_subtotal(self, obj):
        item_total = obj.quantity * (obj.price_at_time or obj.product.price)
        extras_total = sum(extra.quantity * extra.price_at_time for extra in obj.extras.all())
        return item_total + extras_total


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('total_amount', 'user')


class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    class Meta:
        model = Order
        fields = ('status', 'payment_type', 'items')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = validated_data.pop('user', None) or self.context['request'].user
        order = Order.objects.create(user=user, **validated_data)

        for item_data in items_data:
            product_id = item_data['product']
            quantity = item_data['quantity']
            size = item_data.get('size', 'M')
            extras_data = item_data.get('extras', [])

            order_item = OrderItem.objects.create(
                order=order,
                product_id=product_id,
                quantity=quantity,
                size=size
            )

            for extra_data in extras_data:
                OrderItemExtra.objects.create(
                    order_item=order_item,
                    extra_id=extra_data['extra'],
                    quantity=extra_data.get('quantity', 1)
                )

        order.calculate_total()
        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status',)


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ExtraCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extra
        fields = '__all__'


class ShiftSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    cash_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ('user', 'total_sales', 'cash_sales', 'card_sales', 'total_expenses')
    
    def get_cash_remaining(self, obj):
        if obj.closing_cash is not None:
            return obj.closing_cash
        return obj.opening_cash + obj.cash_sales - obj.total_expenses - obj.depot_amount


class ShiftCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ('opening_cash',)


class ShiftCloseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ('closing_cash', 'depot_amount')


class ExpenseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('user', 'shift')


class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ('description', 'amount')
