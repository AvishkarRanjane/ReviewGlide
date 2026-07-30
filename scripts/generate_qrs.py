#!/usr/bin/env python3
"""
ReviewGlide — Automated QR Code Generator & Synchronizer
Monitors businesses.json and automatically generates high-resolution QR codes for each registered business.
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

# Dynamic relative path resolution (Platform independent)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

DATA_FILE = os.path.join(BASE_DIR, "public", "data", "businesses.json")
QR_DIR = os.path.join(BASE_DIR, "public", "qr-codes")
STATE_FILE = os.path.join(BASE_DIR, "public", "data", "sync_state.json")

# Configurable Production URL Base
DEFAULT_BASE_URL = "https://reviewglide.vercel.app/?id="
BASE_URL = os.environ.get("REVIEWGLIDE_BASE_URL", DEFAULT_BASE_URL)

def get_json_data():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[!] Warning: Could not parse {DATA_FILE}: {e}")
        return None

def save_json_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def get_qr_ids():
    if not os.path.exists(QR_DIR):
        return set()
    ids = set()
    for filename in os.listdir(QR_DIR):
        if filename.endswith("-qr.png"):
            ids.add(filename.replace("-qr.png", ""))
    return ids

def generate_qr(profile_id):
    target_url = f"{BASE_URL}{profile_id}"
    encoded_url = urllib.parse.quote(target_url, safe="")
    api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=15&data={encoded_url}"
    file_path = os.path.join(QR_DIR, f"{profile_id}-qr.png")
    
    os.makedirs(QR_DIR, exist_ok=True)
    try:
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": "ReviewGlide-QR-Generator/1.0"}
        )
        with urllib.request.urlopen(req) as resp, open(file_path, "wb") as out:
            out.write(resp.read())
        print(f"[+] Successfully generated QR Code for: '{profile_id}' -> {file_path}")
    except Exception as e:
        print(f"[!] Error generating QR code for {profile_id}: {e}")

def delete_qr(profile_id):
    file_path = os.path.join(QR_DIR, f"{profile_id}-qr.png")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            print(f"[-] Removed QR Code: '{profile_id}'")
        except Exception as e:
            print(f"[!] Could not remove {file_path}: {e}")

def get_state():
    if not os.path.exists(STATE_FILE):
        return set()
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    except Exception:
        return set()

def save_state(state_set):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted(list(state_set)), f, indent=2)

def run_once():
    """Generates missing QR codes once and exits."""
    os.makedirs(QR_DIR, exist_ok=True)
    data = get_json_data() or []
    current_ids = {b["id"] for b in data if "id" in b}
    print(f"[*] Found {len(current_ids)} business entries in JSON database.")
    
    for biz_id in current_ids:
        qr_file = os.path.join(QR_DIR, f"{biz_id}-qr.png")
        if not os.path.exists(qr_file):
            generate_qr(biz_id)
        else:
            print(f"[OK] QR Code already exists for '{biz_id}'")
            
    save_state(current_ids)
    print("[OK] All QR codes synced successfully.")

def sync_loop():
    """Background monitoring loop."""
    print("=" * 60)
    print("  ReviewGlide QR Code Background Synchronization Engine")
    print(f"  Target URL Pattern: {BASE_URL}<id>")
    print("=" * 60)
    print("Press Ctrl+C to terminate background monitoring.\n")
    
    os.makedirs(QR_DIR, exist_ok=True)
    
    if not os.path.exists(STATE_FILE):
        initial_data = get_json_data() or []
        initial_ids = {b["id"] for b in initial_data if "id" in b}
        save_state(initial_ids)

    while True:
        try:
            time.sleep(2)
            last_state = get_state()
            current_data = get_json_data()
            if current_data is None:
                continue
                
            current_json_ids = {b["id"] for b in current_data if "id" in b}
            current_qr_ids = get_qr_ids()

            changed = False
            json_added = current_json_ids - last_state
            json_removed = last_state - current_json_ids
            qr_removed = last_state - current_qr_ids

            for biz_id in json_added:
                generate_qr(biz_id)
                changed = True
            
            for biz_id in json_removed:
                delete_qr(biz_id)
                changed = True
            
            for biz_id in qr_removed:
                if biz_id in current_json_ids:
                    print(f"[-] QR image deleted manually for '{biz_id}'. Syncing JSON database...")
                    current_data = [b for b in current_data if b.get("id") != biz_id]
                    save_json_data(current_data)
                    current_json_ids.remove(biz_id)
                    changed = True

            if changed:
                save_state(current_json_ids)

        except KeyboardInterrupt:
            print("\n[*] Sync engine stopped cleanly.")
            break
        except Exception as e:
            print(f"[!] Exception in sync loop: {e}")
            time.sleep(3)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        run_once()
    else:
        run_once()
