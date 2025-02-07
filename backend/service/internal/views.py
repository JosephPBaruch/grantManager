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

@api_view(['POST'])
def create_transaction(request):
    user_data = request.data.get('user')
    transaction_data = request.data.get('transaction')

    if not user_data or not transaction_data:
        return Response({'error': 'User and transaction data are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user_serializer = UserSerializer(data=user_data)
    if user_serializer.is_valid():
        user = user_serializer.save()
        transaction_data['user'] = user.id
        transaction_serializer = TransactionSerializer(data=transaction_data)
        if transaction_serializer.is_valid():
            transaction_serializer.save()
            return Response(transaction_serializer.data, status=status.HTTP_201_CREATED)
        return Response(transaction_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.
