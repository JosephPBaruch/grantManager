# Generated by Django 5.1.5 on 2025-02-10 23:17

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("internal", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="password",
            field=models.CharField(default="", max_length=128),
        ),
    ]
