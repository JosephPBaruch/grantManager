from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
