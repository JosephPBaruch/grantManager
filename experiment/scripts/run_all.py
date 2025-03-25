import subprocess

def run_script(script_name, *args):
    result = subprocess.run(['python', script_name, *args], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

if __name__ == "__main__":
    scripts = [
        ('reset.py',),
        ('run_trigger.py',),
        ('run_insert.py', '../sql/insert.sql'), 
        ('run_insert.py', '../sql/insert.sql') # Running a second time to break
    ]
    
    for script in scripts:
        print(f"Running {script[0]}")
        run_script(*script)
        input("Press Enter to continue:")
