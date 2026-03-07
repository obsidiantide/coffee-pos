from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Default/Medium price
    price_small = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_large = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.price} AZN"
    
    def get_price_for_size(self, size='M'):
        """Get price based on size"""
        if size == 'S' and self.price_small:
            return self.price_small
        elif size == 'L' and self.price_large:
            return self.price_large
        return self.price  # Default to medium price


class Extra(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.price} AZN"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('split', 'Split'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPE_CHOICES, default='cash')
    cash_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    card_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    preparation_started_at = models.DateTimeField(null=True, blank=True)
    ready_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.total_amount} AZN"

    def calculate_total(self):
        item_total = sum((item.quantity * (item.price_at_time or item.product.price)) for item in self.items.all())
        extras_total = 0
        for item in self.items.all():
            for extra_item in item.extras.all():
                extras_total += extra_item.quantity * (extra_item.price_at_time or extra_item.extra.price)
        total = item_total + extras_total
        self.total_amount = total
        self.save(update_fields=["total_amount", "updated_at"])
        return total

    def start_preparation(self):
        from django.utils import timezone
        self.status = 'preparing'
        self.preparation_started_at = timezone.now()
        self.save(update_fields=['status', 'preparation_started_at', 'updated_at'])

    def mark_ready(self):
        from django.utils import timezone
        self.status = 'ready'
        self.ready_at = timezone.now()
        self.save(update_fields=['status', 'ready_at', 'updated_at'])

    def get_preparation_time(self):
        if self.preparation_started_at and self.ready_at:
            return self.ready_at - self.preparation_started_at
        return None


class OrderItem(models.Model):
    SIZE_CHOICES = [
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=1, choices=SIZE_CHOICES, default='M')
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    def save(self, *args, **kwargs):
        if self.price_at_time is None:
            self.price_at_time = self.product.get_price_for_size(self.size)
        super().save(*args, **kwargs)


class OrderItemExtra(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='extras')
    extra = models.ForeignKey(Extra, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.extra.name}"

    def save(self, *args, **kwargs):
        if self.price_at_time is None:
            self.price_at_time = self.extra.price
        super().save(*args, **kwargs)


class Shift(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shifts')
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    opening_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    closing_cash = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cash_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    card_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    depot_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-opened_at']
    
    def __str__(self):
        return f"Shift {self.id} - {self.user.username} - {self.opened_at.strftime('%Y-%m-%d %H:%M')}"
    
    def calculate_totals(self):
        from django.db.models import Sum, Q
        orders = Order.objects.filter(
            created_at__gte=self.opened_at,
            status='completed'
        )
        if self.closed_at:
            orders = orders.filter(created_at__lte=self.closed_at)
        
        self.total_sales = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        self.cash_sales = orders.filter(payment_type='cash').aggregate(total=Sum('total_amount'))['total'] or 0
        self.card_sales = orders.filter(payment_type='card').aggregate(total=Sum('total_amount'))['total'] or 0
        
        expenses = Expense.objects.filter(
            created_at__gte=self.opened_at
        )
        if self.closed_at:
            expenses = expenses.filter(created_at__lte=self.closed_at)
        
        self.total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
        self.save(update_fields=['total_sales', 'cash_sales', 'card_sales', 'total_expenses'])


class Expense(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='expenses', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.description} - {self.amount} AZN"
