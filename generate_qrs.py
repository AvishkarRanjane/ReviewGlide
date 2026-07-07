import json
import os
import time
import urllib.request
import urllib.parse
import sys

DATA_FILE = r"c:\Users\AVISHKAR\Documents\projects\websites\QR Code\data\businesses.json"
QR_DIR = r"c:\Users\AVISHKAR\Documents\projects\websites\QR Code\QR Code"
STATE_FILE = r"c:\Users\AVISHKAR\Documents\projects\websites\QR Code\sync_state.json"
BASE_URL = "http://127.0.0.1:5500/index.html?id="

def get_json_data():
    if not os.path.exists(DATA_FILE): return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return None

def save_json_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def get_qr_ids():
    if not os.path.exists(QR_DIR): return set()
    ids = set()
    for f in os.listdir(QR_DIR):
        if f.endswith("_qr.png"):
            ids.add(f.replace("_qr.png", ""))
    return ids

def generate_qr(profile_id):
    target_url = BASE_URL + profile_id
    encoded_url = urllib.parse.quote(target_url)
    api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=500x500&data={encoded_url}"
    file_path = os.path.join(QR_DIR, f"{profile_id}_qr.png")
    try:
        urllib.request.urlretrieve(api_url, file_path)
        print(f"[+] Generated QR for: {profile_id}")
    except Exception as e:
        print(f"Error generating QR for {profile_id}: {e}")

def delete_qr(profile_id):
    file_path = os.path.join(QR_DIR, f"{profile_id}_qr.png")
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"[-] Deleted QR for: {profile_id}")

def get_state():
    if not os.path.exists(STATE_FILE): return set()
    try:
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return set(json.load(f))
    except:
        return set()

def save_state(state_set):
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(list(state_set), f)

def sync_loop():
    print("Background Sync started...")
    print("Monitoring businesses.json and QR Code folder.")
    print("Press Ctrl+C to stop.\n")
    os.makedirs(QR_DIR, exist_ok=True)
    
    # Initialize state if it doesn't exist
    if not os.path.exists(STATE_FILE):
        initial_data = get_json_data() or []
        initial_ids = {b["id"] for b in initial_data}
        save_state(initial_ids)

    while True:
        try:
            time.sleep(2) # Poll every 2 seconds
            
            last_state = get_state()
            current_data = get_json_data()
            if current_data is None:
                continue # Skip loop if JSON is currently invalid/being edited
                
            current_json_ids = {b["id"] for b in current_data}
            current_qr_ids = get_qr_ids()

            changed = False

            # 1. Did user add to JSON?
            json_added = current_json_ids - last_state
            
            # 2. Did user remove from JSON?
            json_removed = last_state - current_json_ids

            # 3. Did user delete QR from Folder?
            qr_removed = last_state - current_qr_ids

            if json_added:
                for biz_id in json_added:
                    generate_qr(biz_id)
                changed = True
            
            if json_removed:
                for biz_id in json_removed:
                    delete_qr(biz_id)
                changed = True
            
            if qr_removed:
                for biz_id in qr_removed:
                    # If QR was removed but it's still in JSON, it means user deleted the QR manually.
                    if biz_id in current_json_ids:
                        print(f"[-] QR deleted by user, removing '{biz_id}' from JSON...")
                        current_data = [b for b in current_data if b["id"] != biz_id]
                        save_json_data(current_data)
                        current_json_ids.remove(biz_id)
                        changed = True

            if changed:
                save_state(current_json_ids)

        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except Exception as e:
            print(f"Error in sync loop: {e}")
            time.sleep(2)

if __name__ == "__main__":
    sync_loop()
