from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'extras', views.ExtraViewSet, basename='extra')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'shifts', views.ShiftViewSet, basename='shift')
router.register(r'expenses', views.ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/today/', views.todays_orders, name='todays_orders'),
    path('reports/sales/', views.sales_report, name='sales_report'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]
