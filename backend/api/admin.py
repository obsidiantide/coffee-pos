from django.contrib import admin
from .models import Category, Product, Extra, Order, OrderItem, OrderItemExtra, Shift, Expense


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Extra)
class ExtraAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


class OrderItemExtraInline(admin.TabularInline):
    model = OrderItemExtra
    extra = 1
    readonly_fields = ('price_at_time',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ('price_at_time',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'payment_type', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_type', 'created_at', 'user')
    search_fields = ('user__username', 'id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OrderItemInline]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items__product', 'items__extras__extra')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'size', 'price_at_time')
    list_filter = ('product', 'size', 'order__created_at')
    search_fields = ('product__name', 'order__id')
    inlines = [OrderItemExtraInline]


@admin.register(OrderItemExtra)
class OrderItemExtraAdmin(admin.ModelAdmin):
    list_display = ('order_item', 'extra', 'quantity', 'price_at_time')
    list_filter = ('extra', 'order_item__order__created_at')
    search_fields = ('extra__name', 'order_item__order__id')


class ExpenseInline(admin.TabularInline):
    model = Expense
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'opened_at', 'closed_at', 'is_active', 'total_sales', 'cash_sales', 'card_sales')
    list_filter = ('is_active', 'user', 'opened_at')
    search_fields = ('user__username',)
    ordering = ('-opened_at',)
    readonly_fields = ('opened_at', 'total_sales', 'cash_sales', 'card_sales', 'total_expenses')
    inlines = [ExpenseInline]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'shift', 'description', 'amount', 'created_at')
    list_filter = ('user', 'shift', 'created_at')
    search_fields = ('description', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
