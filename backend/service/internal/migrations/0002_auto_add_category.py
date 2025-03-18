from django.db import migrations, models

def set_default_category(apps, schema_editor):
    Transaction = apps.get_model('internal', 'Transaction')
    for transaction in Transaction.objects.all():
        transaction.category = 'General'
        transaction.save()

class Migration(migrations.Migration):

    dependencies = [
        ('internal', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='category',
            field=models.CharField(max_length=50, default='General'),
        ),
        migrations.RunPython(set_default_category),
    ]
