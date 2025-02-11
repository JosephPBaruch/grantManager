from django.db import models
from django.core.exceptions import ValidationError

class User(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, blank=False, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    admin = models.BooleanField(default=False)
    budgetName = models.CharField(max_length=30, default="")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        max_total_amount = 10000  # Set the maximum allowed total transaction amount
        total_amount = Transaction.objects.filter(user=self.user).aggregate(models.Sum('amount'))['amount__sum'] or 0
        if total_amount + self.amount > max_total_amount:
            raise ValidationError(f"Total transaction amount for user {self.user} exceeds the allowed limit of {max_total_amount}.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transaction {self.id} by {self.user.first_name} {self.user.last_name}"