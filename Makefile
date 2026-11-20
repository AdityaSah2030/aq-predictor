.PHONY: setup data pipeline test web clean

PYTHON = .venv/Scripts/python.exe
PYTEST = .venv/Scripts/pytest.exe

setup:
	python -m venv .venv
	.venv/Scripts/pip install -r requirements.txt
	cd web && npm install

data:
	$(PYTHON) pipeline/01_acquire.py

clean-data:
	$(PYTHON) pipeline/02_clean.py

features:
	$(PYTHON) pipeline/03_features.py

split:
	$(PYTHON) pipeline/05_split.py

models:
	$(PYTHON) pipeline/06_models.py

evaluate:
	$(PYTHON) pipeline/07_evaluate.py

insights:
	$(PYTHON) pipeline/08_insights.py

export:
	$(PYTHON) pipeline/09_export_json.py

pipeline: data clean-data features split models evaluate insights export

test:
	$(PYTEST) tests/ -v

web:
	cd web && npm run dev

build:
	cd web && npm run build
