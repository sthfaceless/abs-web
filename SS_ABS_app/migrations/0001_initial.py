# Generated by Django 2.2.24 on 2021-07-25 12:58

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('somenumber', models.IntegerField()),
                ('somename', models.TextField()),
                ('somefraze', models.CharField(max_length=50)),
            ],
        ),
    ]
