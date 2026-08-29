import os
import csv
import sys
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.dataset_generator import generate_dataset

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "weather_reports_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "weather_nlp_model.pkl")

def train_and_save_model():
    """
    Loads dataset, trains a TF-IDF + Logistic Regression Classifier,
    evaluates performance, and serializes model artifact to disk.
    """
    if not os.path.exists(DATA_PATH):
        print("[*] Dataset not found. Generating fresh ML training dataset...")
        generate_dataset(1400)
        
    texts, labels = [], []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row["text_content"])
            labels.append(row["event_type"])
            
    print(f"[*] Loaded {len(texts)} samples for training across categories: {set(labels)}")
    
    # Train-test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42, stratify=labels)
    
    # Build Scikit-Learn Pipeline: TF-IDF N-gram Vectorizer + Logistic Regression Classifier
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, stop_words="english")),
        ("clf", LogisticRegression(C=1.0, max_iter=200, solver="lbfgs"))
    ])
    
    print("[*] Fitting TF-IDF Vectorizer & Logistic Regression Classifier...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[+] ML Model Training Completed!")
    print(f"[+] Test Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model artifact
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[+] Saved trained model pipeline to {MODEL_PATH}")
    return pipeline

if __name__ == "__main__":
    train_and_save_model()
