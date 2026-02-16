from django.core.management.base import BaseCommand
from appointments.models import Barber, Service

class Command(BaseCommand):
    help = "Seed basic barbers and services"

    def handle(self, *args, **options):
        barbers = ["Mike", "Alex"]
        services = [
            ("Haircut", 30, 3000),
            ("Fade", 45, 4000),
            ("Beard Trim", 15, 1500),
        ]

        for name in barbers:
            Barber.objects.get_or_create(name=name)

        for name, minutes, cents in services:
            Service.objects.get_or_create(
                name=name,
                defaults={"duration_minutes": minutes, "price_cents": cents},
            )
        
        self.stdout.write(self.style.SUCCESS("Seeded barbers and services."))