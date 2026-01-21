import os
import time
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 4000)),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'ssl_verify_identity': False, # Allow self-signed/cloud certs if needed
    'use_pure': True # Use pure Python implementation for broader compatibility
}

def get_db_status():
    """Connects to DB and fetches row counts for key tables."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # List of tables to monitor
        tables = ['Users', 'Posts', 'Comments', 'Likes', 'Friendships', 'Notifications', 'Bookmarks']
        stats = {}
        
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                stats[table] = count
            except mysql.connector.Error:
                # Table might not exist yet
                stats[table] = "N/A"

        conn.close()
        return stats
    except mysql.connector.Error as err:
        return {"Error": str(err)}

def main():
    print(f"📊 Starting Database Monitor (Target: {DB_CONFIG['host']})...")
    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            stats = get_db_status()
            
            # Clear previous output lines (Optional: for cleaner static view, but simple print is requested)
            # os.system('cls' if os.name == 'nt' else 'clear') 
            
            print(f"[{timestamp}] Database Status Update:")
            
            if "Error" in stats:
                 print(f"  ❌ Connection Error: {stats['Error']}")
            else:
                # Format output nicely
                print(f"  ✅ Connection: Healthy")
                
                # Print table stats in columns
                print(f"  ------------------------------------------------")
                print(f"  | {'Table':<15} | {'Row Count':<10} |")
                print(f"  ------------------------------------------------")
                for table, count in stats.items():
                    print(f"  | {table:<15} | {str(count):<10} |")
                print(f"  ------------------------------------------------")
            
            print("") # Empty line
            time.sleep(5) # Update every 5 seconds
            
    except KeyboardInterrupt:
        print("\n🛑 Monitor stopped.")

if __name__ == "__main__":
    main()
