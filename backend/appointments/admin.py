from django.contrib import admin
from .models import Barber, Service, Customer, Appointment, Notification

admin.site.register(Barber)
admin.site.register(Service)
admin.site.register(Customer)
admin.site.register(Appointment)
admin.site.register(Notification)
