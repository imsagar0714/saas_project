from __future__ import absolute_import, unicode_literals

import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")

# 🔥 FORCE REDIS BROKER
app.conf.broker_url = "redis://127.0.0.1:6379/0"

# 🔥 optional serializers
app.conf.accept_content = ["json"]
app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.timezone = "Asia/Kolkata"

app.autodiscover_tasks()