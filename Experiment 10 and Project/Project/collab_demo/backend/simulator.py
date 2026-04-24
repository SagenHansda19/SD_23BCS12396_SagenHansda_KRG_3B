import time
import random
import threading
import json
import datetime
from config import CHANNEL_NAME

WORDS = ["Hello", "Redis", "System", "Design", "RealTime", "Collab", "Architecture", "WebSockets"]

class UserSimulator:
    def __init__(self, collaboration_service):
        self.service = collaboration_service
        self.threads = []
        self.is_running = False
        self.speed_factor = 1.0
        self.user_roles = {}
        
    def set_speed(self, speed):
        self.speed_factor = float(speed)

    def set_user_role(self, user, role):
        self.user_roles[user] = role

    def stop(self):
        self.is_running = False
        for t in self.threads:
            t.join()
        self.threads = []

    def start_static(self, users, text):
        self.stop()
        self.is_running = True
        for user in users:
            self.user_roles[user] = self.user_roles.get(user, "editor")
            t = threading.Thread(target=self._simulate_static, args=(user, text), daemon=True)
            self.threads.append(t)
            t.start()

    def start_continuous(self, users, speed=1.0):
        self.stop()
        self.set_speed(speed)
        self.is_running = True
        for user in users:
            self.user_roles[user] = self.user_roles.get(user, "editor")
            t = threading.Thread(target=self._simulate_continuous, args=(user,), daemon=True)
            self.threads.append(t)
            t.start()

    def _simulate_static(self, user, text):
        for char in text:
            if not self.is_running:
                break
            
            while self.user_roles.get(user, "editor") == "viewer" and self.is_running:
                time.sleep(0.5)
                
            if not self.is_running:
                break
                
            time.sleep(random.uniform(0.15, 0.45) / self.speed_factor)
            self.service.append_character(user, char, self.user_roles.get(user, "editor"))

    def _simulate_continuous(self, user):
        while self.is_running:
            while self.user_roles.get(user, "editor") == "viewer" and self.is_running:
                time.sleep(0.5)
                
            if not self.is_running:
                break
                
            word = random.choice(WORDS) + " "
            for char in word:
                if not self.is_running:
                    break
                while self.user_roles.get(user, "editor") == "viewer" and self.is_running:
                    time.sleep(0.5)
                if not self.is_running:
                    break
                    
                time.sleep(random.uniform(0.15, 0.45) / self.speed_factor)
                self.service.append_character(user, char, self.user_roles.get(user, "editor"))
            
            # small pause between words
            time.sleep(random.uniform(0.5, 1.5) / self.speed_factor)
