import json
from pprint import pprint
import csv
import time


# Import your backend setup (adjust the import as needed)
from server_v5 import crags

def load_questions_from_txt(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

def load_questions_from_csv(filepath, column="question"):
    questions = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if column in row and row[column].strip():
                questions.append(row[column].strip())
    return questions

def run_batch_test(questions, output_report="crags_test_report.json",  wait_time=30, batch_size=10):
    results = []
    for idx, question in enumerate(questions):
        print(f"\n=== [{idx+1}/{len(questions)}] Q: {question} ===")
        inputs = {"question": question}
        process_path = []
        websearch_used = False
        final_generation = ""
        fallback_detected = False

        try:
            for output in crags.stream(inputs):
                for key, value in output.items():
                    process_path.append(key)
                    # Check if websearch node was used
                    if key == "web_search_node":
                        websearch_used = True
                    # Check for fallback in documents
                    if key in ("generate", "web_search_node", "grade_documents", "grade_prior_docs"):
                        docs = value.get("documents", [])
                        if docs and any(
                            "No relevant information found online." in (getattr(doc, "page_content", "") or doc.get("page_content", ""))
                            for doc in docs
                        ):
                            fallback_detected = True
                    # Get the final generation
                    if key == "generate":
                        final_generation = value.get("generation", "")

            results.append({
                "question": question,
                "process_path": process_path,
                "websearch_used": websearch_used,
                "fallback_detected": fallback_detected,
                "final_generation": final_generation,
            })

            print(f"Process path: {process_path}")
            print(f"Websearch used: {websearch_used}")
            print(f"Fallback detected: {fallback_detected}")
            print(f"Final answer: {final_generation}...\n")

        except Exception as e:
            print(f"Error processing question: {e}")
            results.append({
                "question": question,
                "process_path": process_path,
                "websearch_used": websearch_used,
                "fallback_detected": True,
                "final_generation": f"Error: {e}",
            })

        # Add a delay after every batch_size questions
        if (idx + 1) % batch_size == 0:
            print(f"Processed {batch_size} questions. Waiting for {wait_time} seconds to avoid hitting rate limits...")
            time.sleep(wait_time)
    


    # Save results to a JSON file
    with open(output_report, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nBatch test complete. Results saved to {output_report}")

    # Optionally, print summary of "not so well" cases
    print("\nQuestions with fallback or errors:")
    for r in results:
        if r["fallback_detected"] or not r["final_generation"].strip() or "error" in r["final_generation"].lower():
            print(f"- {r['question']} (Websearch: {r['websearch_used']})")

    return results

def analyze_results(output_report="crags_test_report.json"):
    """
    Analyze the results saved in the JSON file and print statistics.
    
    Args:
        output_report (str): Path to the JSON file containing the results.
    """
    try:
        with open(output_report, "r", encoding="utf-8") as f:
            results = json.load(f)

        total_questions = len(results)
        total_answers = sum(1 for r in results if r["final_generation"].strip())
        total_websearch = sum(1 for r in results if r["websearch_used"])
        failed_questions = [r["question"] for r in results if r["fallback_detected"] or not r["final_generation"].strip()]

        print("\n=== Statistics ===")
        print(f"Total questions processed: {total_questions}")
        print(f"Total answers generated: {total_answers}")
        print(f"Total websearches performed: {total_websearch}")
        print(f"Questions that failed or used fallback: {len(failed_questions)}")
        print("\nFailed Questions:")
        for question in failed_questions:
            print(f"- {question}")

    except FileNotFoundError:
        print(f"Error: The file {output_report} does not exist.")
    except Exception as e:
        print(f"Error analyzing results: {e}")


if __name__ == "__main__":
    # Choose your input file and format
    questions = load_questions_from_txt("test_questions.txt")
    #questions = load_questions_from_csv("questions.csv", column="question")  # Adjust column name if needed

    run_batch_test(questions)
    analyze_results()

