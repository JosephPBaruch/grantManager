from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import CustomConstraint

@receiver(post_save, sender=User)
def create_user_constraint(sender, instance, created, **kwargs):
    if created:
        UserConstraint.objects.create(user=instance)
