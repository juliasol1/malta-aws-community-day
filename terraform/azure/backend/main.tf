# Private Azure Backend Service powered by Microsoft Cobalt 100 ARM64 processor.
# Consumed exclusively over the AWS <-> Azure Multicloud Interconnect.

resource "azurerm_resource_group" "backend" {
  name     = "${var.prefix}-backend-rg"
  location = local.core.location
  tags     = var.tags
}

# -----------------------------------------------------------------------------
# SSH Authentication
# -----------------------------------------------------------------------------

resource "tls_private_key" "ssh" {
  count     = var.admin_ssh_public_key == "" ? 1 : 0
  algorithm = "ED25519"
}

locals {
  admin_ssh_public_key = var.admin_ssh_public_key != "" ? var.admin_ssh_public_key : tls_private_key.ssh[0].public_key_openssh
}

# -----------------------------------------------------------------------------
# Private Network Interface
# -----------------------------------------------------------------------------

resource "azurerm_network_interface" "backend" {
  name                = "${var.prefix}-backend-nic"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  tags                = var.tags

  ip_configuration {
    name                          = "internal"
    subnet_id                     = local.core.backend_subnet_id
    private_ip_address_allocation = "Static"
    private_ip_address            = var.backend_private_ip
    public_ip_address_id          = null # Strictly zero public ingress
  }
}

# -----------------------------------------------------------------------------
# Cloud-Init: Self-Contained Latency Reflector & Commit Receiver Microservice
# -----------------------------------------------------------------------------

locals {
  cloud_init = <<-EOF
    #cloud-config
    package_update: true
    packages:
      - curl
      - python3
      - python3-pip
      - sqlite3

    write_files:
      - path: /opt/demo-backend/server.py
        permissions: '0755'
        content: |
          import http.server
          import json
          import socketserver
          import time
          import sqlite3

          PORT = 8080

          # Initialize SQLite database for transaction commit recording
          conn = sqlite3.connect('/opt/demo-backend/transactions.db')
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
                          "instance_type": "Standard_D2ps_v6",
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
                      conn = sqlite3.connect('/opt/demo-backend/transactions.db')
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

                      conn = sqlite3.connect('/opt/demo-backend/transactions.db')
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

      - path: /etc/systemd/system/demo-backend.service
        permissions: '0644'
        content: |
          [Unit]
          Description=Malta AWS-Azure Multicloud Interconnect Backend
          After=network.target

          [Service]
          Type=simple
          User=root
          WorkingDirectory=/opt/demo-backend
          ExecStart=/usr/bin/python3 /opt/demo-backend/server.py
          Restart=always
          RestartSec=3

          [Install]
          WantedBy=multi-user.target

    runcmd:
      - systemctl daemon-reload
      - systemctl enable demo-backend.service
      - systemctl start demo-backend.service
  EOF
}

# -----------------------------------------------------------------------------
# Microsoft Cobalt 100 ARM64 Linux Virtual Machine
# -----------------------------------------------------------------------------

resource "azurerm_linux_virtual_machine" "backend" {
  name                  = "${var.prefix}-cobalt-vm"
  location              = azurerm_resource_group.backend.location
  resource_group_name   = azurerm_resource_group.backend.name
  network_interface_ids = [azurerm_network_interface.backend.id]
  size                  = var.vm_size
  admin_username        = var.admin_username
  custom_data           = base64encode(local.cloud_init)
  tags                  = var.tags

  admin_ssh_key {
    username   = var.admin_username
    public_key = local.admin_ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    disk_size_gb         = 30
  }

  # Canonical Ubuntu 24.04 LTS native ARM64 release
  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server-arm64"
    version   = "latest"
  }
}
