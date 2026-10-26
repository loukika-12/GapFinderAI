# Sample Notes: Data Science Fundamentals

**Purpose:** Companion notes for [sample-syllabus.md](sample-syllabus.md). These notes are included for evaluator review and manual testing; they are not automatically seeded into every user's workspace.

## 1. Data science workflow
A common workflow is to define a question, collect relevant data, clean and validate it, explore patterns, build an analysis or model, evaluate the result, and communicate findings. The workflow is iterative: exploration can reveal data-quality problems or suggest a better question.

## 2. Missing values and duplicates
Missing values should be inspected before choosing a treatment. Depending on why values are missing and the task, options include removing affected rows, imputing a value, or explicitly representing missingness. Duplicate records can inflate counts or bias an analysis, so determine whether they represent true repeated events or accidental duplication before removing them.

## 3. Mean and median
The mean is the sum of observations divided by the number of observations. The median is the middle value after sorting the observations. The median is generally less affected by extreme values than the mean, so it can better represent a skewed distribution.

Example values: 2, 3, 3, 4, 18.
- Mean = (2 + 3 + 3 + 4 + 18) / 5 = 6.
- Median = 3.
The large value 18 pulls the mean above the median.

## 4. Correlation and causation
Correlation describes an association between variables. It does not by itself show that one variable causes the other. Confounding variables, reverse direction, or coincidence can explain an observed association. Causal claims require stronger study design and evidence.

## 5. Classification and regression
Classification predicts a category, such as spam/not spam. Regression predicts a numeric quantity, such as energy consumption. A dataset is commonly divided into training and test sets so performance can be evaluated on data not used to fit the model.

## 6. Classification metrics
- Accuracy: fraction of all predictions that are correct.
- Precision: fraction of predicted positives that are truly positive.
- Recall: fraction of actual positives correctly identified.
- F1 score: harmonic mean of precision and recall.

Accuracy alone can be misleading when classes are imbalanced. Precision and recall help explain different error trade-offs.

## 7. Example self-check questions
1. Why might the median be more representative than the mean for a skewed distribution?
2. Why is correlation not enough to establish causation?
3. How does classification differ from regression?
4. Why should a test set remain separate from model training?
5. When might accuracy be misleading?

Answers should be checked against the source notes and expanded with citations once RAG is implemented.
