# Private Azure Backend Service powered by Azure Container Instances (ACI)
# Acting as the Cobalt 100 ARM64 workload reflector and transaction receiver.
# Consumed exclusively over the AWS <-> Azure Multicloud Interconnect.

resource "azurerm_resource_group" "backend" {
  name     = "${var.prefix}-backend-rg"
  location = local.core.location
  tags     = var.tags
}

# -----------------------------------------------------------------------------
# Microservice Python Server Script
# -----------------------------------------------------------------------------

locals {
  server_script = <<-PY
import http.server
import json
import socketserver
import time
import sqlite3

PORT = 8080

conn = sqlite3.connect('/tmp/transactions.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS tx_log (
    tx_id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp REAL,
    source_cloud TEXT,
    source_region TEXT,
    processor TEXT,
    status TEXT
)''')
conn.commit()
conn.close()

class DemoHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            resp = {
                "status": "healthy",
                "cloud": "azure",
                "region": "germanywestcentral",
                "processor": "Microsoft Cobalt 100 ARM64 (Neoverse-CSS-N2)",
                "instance_type": "Standard_D2ps_v6 (Container Profile)",
                "timestamp": time.time()
            }
            self.wfile.write(json.dumps(resp).encode())
        elif self.path == '/api/ping':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            resp = {"pong": True, "server_time": time.time()}
            self.wfile.write(json.dumps(resp).encode())
        elif self.path == '/api/status':
            conn = sqlite3.connect('/tmp/transactions.db')
            c = conn.cursor()
            c.execute('SELECT COUNT(*) FROM tx_log')
            count = c.fetchone()[0]
            conn.close()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"total_committed": count, "cloud": "azure"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/transactions':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8')) if post_data else {}

            conn = sqlite3.connect('/tmp/transactions.db')
            c = conn.cursor()
            c.execute('''INSERT INTO tx_log (timestamp, source_cloud, source_region, processor, status) 
                         VALUES (?, ?, ?, ?, ?)''',
                      (time.time(), data.get('source', 'aws'), data.get('region', 'eu-central-1'), 
                       data.get('chip', 'graviton4'), 'COMMITTED'))
            tx_id = c.lastrowid
            conn.commit()
            conn.close()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            resp = {
                "tx_id": tx_id,
                "status": "COMMITTED",
                "target_cloud": "azure",
                "target_chip": "Cobalt 100 ARM64",
                "timestamp": time.time()
            }
            self.wfile.write(json.dumps(resp).encode())
        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", PORT), DemoHandler) as httpd:
    httpd.serve_forever()
PY
}

# -----------------------------------------------------------------------------
# Azure Container Instance (Private VNet Interconnect Endpoint)
# -----------------------------------------------------------------------------

resource "azurerm_container_group" "backend" {
  name                = "${var.prefix}-cobalt-container"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  ip_address_type     = "Private"
  subnet_ids          = [local.core.backend_subnet_id]
  os_type             = "Linux"

  container {
    name   = "reflector"
    image  = "python:3.11-alpine"
    cpu    = "1.0"
    memory = "1.0"

    ports {
      port     = 8080
      protocol = "TCP"
    }

    commands = [
      "python3",
      "-c",
      local.server_script
    ]
  }

  tags = var.tags
}
