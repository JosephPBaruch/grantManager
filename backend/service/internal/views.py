from django.shortcuts import render
from rest_framework import viewsets
from .models import User, Transaction
from .serializers import UserSerializer, TransactionSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer