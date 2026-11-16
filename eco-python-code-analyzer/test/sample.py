# Sample Python file to test eco-code analysis

# Example of a potentially inefficient loop
numbers = []
for i in range(100):
    numbers.append(i)  # Could be replaced with list comprehension

# Example of resource-intensive operation
def process_data(data):
    # Simulating resource-heavy operation
    processed = []
    for item in data:
        processed.append(item * 2)  # Could be optimized
    return processed

# Main execution
if __name__ == "__main__":
    data = list(range(1000))
    result = process_data(data)
    print(f"Processed {len(result)} items")
