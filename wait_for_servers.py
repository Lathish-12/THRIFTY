import socket
import time
import sys

def wait_for_port(port, host='localhost', timeout=60):
    start_time = time.time()
    print(f"Checking {host}:{port}...")
    while True:
        try:
            with socket.create_connection((host, port), timeout=1):
                print(f"Port {port} is OPEN!")
                return True
        except (socket.timeout, ConnectionRefusedError):
            if time.time() - start_time > timeout:
                print(f"Timeout waiting for port {port}")
                return False
            time.sleep(1)

if __name__ == "__main__":
    # Wait for Backend (8000) and Frontend (5173)
    print("Waiting for servers to be ready...")
    backend_ready = wait_for_port(8000)
    frontend_ready = wait_for_port(5173)
    
    if backend_ready and frontend_ready:
        print("Ready")
        sys.exit(0)
    else:
        print("Timeout")
        sys.exit(1)
