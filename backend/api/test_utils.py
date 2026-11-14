from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone

from authentication.models import User
from .models import Category, Order, OrderItem, Product
from .utils import get_order_statistics, get_popular_products

pytestmark = pytest.mark.django_db


@pytest.fixture
def barista():
    return User.objects.create_user(username='barista', password='pw')


@pytest.fixture
def category():
    return Category.objects.create(name='Coffee')


@pytest.fixture
def latte(category):
    return Product.objects.create(name='Latte', price=Decimal('5.00'), category=category)


@pytest.fixture
def espresso(category):
    return Product.objects.create(name='Espresso', price=Decimal('3.00'), category=category)


def make_order(user, total, payment_type='cash', status='completed'):
    return Order.objects.create(
        user=user, total_amount=Decimal(total), payment_type=payment_type, status=status
    )


def test_statistics_empty_day(barista):
    stats = get_order_statistics()
    assert stats['total_orders'] == 0
    assert stats['total_revenue'] == 0
    assert stats['cash_revenue'] == 0
    assert stats['card_revenue'] == 0
    assert stats['avg_preparation_time'] is None


def test_statistics_splits_revenue_by_payment_type(barista):
    make_order(barista, '10.00', 'cash')
    make_order(barista, '4.50', 'cash')
    make_order(barista, '7.00', 'card')

    stats = get_order_statistics()

    assert stats['total_orders'] == 3
    assert stats['total_revenue'] == Decimal('21.50')
    assert stats['cash_revenue'] == Decimal('14.50')
    assert stats['card_revenue'] == Decimal('7.00')


def test_statistics_ignores_non_completed_orders(barista):
    make_order(barista, '10.00')
    make_order(barista, '99.00', status='cancelled')
    make_order(barista, '50.00', status='pending')

    stats = get_order_statistics()

    assert stats['total_orders'] == 1
    assert stats['total_revenue'] == Decimal('10.00')


def test_statistics_filters_by_date(barista):
    old = make_order(barista, '8.00')
    Order.objects.filter(pk=old.pk).update(created_at=timezone.now() - timedelta(days=3))
    make_order(barista, '2.00')

    past = get_order_statistics(timezone.now().date() - timedelta(days=3))

    assert past['total_orders'] == 1
    assert past['total_revenue'] == Decimal('8.00')


def test_statistics_average_preparation_time(barista):
    start = timezone.now() - timedelta(minutes=30)
    for minutes in (2, 4):
        order = make_order(barista, '5.00')
        order.preparation_started_at = start
        order.ready_at = start + timedelta(minutes=minutes)
        order.save()
    make_order(barista, '5.00')  # never prepared: excluded from the average

    stats = get_order_statistics()

    assert stats['avg_preparation_time'] == timedelta(minutes=3)


def test_popular_products_sorted_by_quantity(barista, latte, espresso):
    first = make_order(barista, '13.00')
    OrderItem.objects.create(order=first, product=latte, quantity=1)
    OrderItem.objects.create(order=first, product=espresso, quantity=3)
    second = make_order(barista, '5.00')
    OrderItem.objects.create(order=second, product=espresso, quantity=2)

    popular = get_popular_products()

    assert [p['product__name'] for p in popular] == ['Espresso', 'Latte']
    assert popular[0]['total_quantity'] == 5
    assert popular[0]['order_count'] == 2
    assert popular[1]['total_quantity'] == 1


def test_popular_products_respects_window_and_status(barista, latte, espresso):
    old = make_order(barista, '5.00')
    OrderItem.objects.create(order=old, product=latte, quantity=9)
    Order.objects.filter(pk=old.pk).update(created_at=timezone.now() - timedelta(days=30))
    cancelled = make_order(barista, '5.00', status='cancelled')
    OrderItem.objects.create(order=cancelled, product=latte, quantity=9)
    recent = make_order(barista, '3.00')
    OrderItem.objects.create(order=recent, product=espresso, quantity=1)

    popular = get_popular_products(days=7)

    assert [p['product__name'] for p in popular] == ['Espresso']
