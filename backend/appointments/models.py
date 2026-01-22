from django.db import models
from django.utils import timezone

class Barber(models.Model):
    name = models.CharField(max_length=100)
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=120)
    duration_minutes = models.PositiveIntegerField()
    price_cents = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.duration_minutes}m)"

class Customer(models.Model):
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30, blank=True, default="")

    def __str__(self) -> str:
        return self.name

class Appointment(models.Model):
    class Status(models.TextChoices):
        BOOKED = "BOOKED"
        CANCELLED = "CANCELLED"
        COMPLETED = "COMPLETED"

    barber = models.ForeignKey(Barber, on_delete=models.PROTECT)
    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.BOOKED,
    )

    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f"{self.customer} - {self.service} @ {self.start_time}"
    
    class Meta:
        indexes = [
            models.Index(fields=["barber", "start_time"]),
        ]

class Notification(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f"Notif({self.customer}): {self.message[:30]}"

