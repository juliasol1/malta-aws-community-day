import json
import time
import urllib.request
import threading

ALB = "http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com"
LOCAL = "http://127.0.0.1:8080"

def worker(worker_id):
    while True:
        try:
            req = urllib.request.Request(f"{ALB}/internal/bridge/poll")
            with urllib.request.urlopen(req, timeout=12) as r:
                if r.status == 200:
                    task = json.loads(r.read().decode('utf-8'))
                    req_id = task['id']
                    method = task.get('method', 'GET')
                    path = task.get('path', '/api/ping')
                    body = task.get('body')
                    
                    try:
                        local_req = urllib.request.Request(
                            f"{LOCAL}{path}",
                            data=body.encode('utf-8') if body else None,
                            headers={'Content-Type': 'application/json'} if body else {},
                            method=method
                        )
                        with urllib.request.urlopen(local_req, timeout=2) as lr:
                            res_body = lr.read().decode('utf-8')
                            status = lr.status
                    except urllib.error.HTTPError as he:
                        status = he.code
                        res_body = str(he)
                    except Exception as e:
                        status = 500
                        res_body = json.dumps({"error": str(e)})

                    ret_req = urllib.request.Request(
                        f"{ALB}/internal/bridge/result",
                        data=json.dumps({"id": req_id, "status": status, "body": res_body}).encode('utf-8'),
                        headers={'Content-Type': 'application/json'},
                        method='POST'
                    )
                    with urllib.request.urlopen(ret_req, timeout=5) as rr:
                        pass
        except Exception:
            time.sleep(0.2)

for i in range(4):
    t = threading.Thread(target=worker, args=(i,), daemon=True)
    t.start()

print("Started 4 Parallel Interconnect Bridge Workers")
while True:
    time.sleep(1)
