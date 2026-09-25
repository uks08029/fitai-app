import numpy as np
import random
import json
import os

class DecisionTreeNode:
    def __init__(self, feature_idx=None, threshold=None, left=None, right=None, value=None):
        self.feature_idx = feature_idx
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    def is_leaf(self):
        return self.value is not None

    def to_dict(self):
        if self.is_leaf():
            return {"value": float(self.value)}
        return {
            "feature_idx": int(self.feature_idx),
            "threshold": float(self.threshold),
            "left": self.left.to_dict(),
            "right": self.right.to_dict()
        }

    @classmethod
    def from_dict(cls, d):
        if "value" in d:
            return cls(value=d["value"])
        return cls(
            feature_idx=d["feature_idx"],
            threshold=d["threshold"],
            left=cls.from_dict(d["left"]),
            right=cls.from_dict(d["right"])
        )

class DecisionTreeRegressorCustom:
    def __init__(self, max_depth=10, min_samples_split=5, max_features=None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root = None

    def fit(self, X, y):
        self.n_features_ = X.shape[1]
        self.root = self._build_tree(X, y, depth=0)
        return self

    def _build_tree(self, X, y, depth):
        n_samples, n_features = X.shape

        if depth >= self.max_depth or n_samples < self.min_samples_split or np.var(y) < 1e-4:
            return DecisionTreeNode(value=np.mean(y))

        # Select random subset of features
        if self.max_features is not None:
            feature_indices = np.random.choice(n_features, size=min(self.max_features, n_features), replace=False)
        else:
            feature_indices = np.arange(n_features)

        best_feat, best_thresh, best_var_red = None, None, -1.0
        current_var = np.var(y) * n_samples

        for feat in feature_indices:
            vals = X[:, feat]
            # Use percentiles for fast threshold exploration
            percentiles = np.percentile(vals, np.linspace(5, 95, 12))
            unique_thresholds = np.unique(percentiles)

            for thresh in unique_thresholds:
                left_mask = vals <= thresh
                right_mask = ~left_mask

                n_left = np.sum(left_mask)
                n_right = n_samples - n_left
                if n_left < 2 or n_right < 2:
                    continue

                var_left = np.var(y[left_mask]) * n_left
                var_right = np.var(y[right_mask]) * n_right
                var_red = current_var - (var_left + var_right)

                if var_red > best_var_red:
                    best_var_red = var_red
                    best_feat = feat
                    best_thresh = thresh

        if best_feat is None or best_var_red <= 0:
            return DecisionTreeNode(value=np.mean(y))

        left_mask = X[:, best_feat] <= best_thresh
        left_child = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right_child = self._build_tree(X[~left_mask], y[~left_mask], depth + 1)

        return DecisionTreeNode(feature_idx=best_feat, threshold=best_thresh, left=left_child, right=right_child)

    def predict_one(self, node, x):
        if node.is_leaf():
            return node.value
        if x[node.feature_idx] <= node.threshold:
            return self.predict_one(node.left, x)
        return self.predict_one(node.right, x)

    def predict(self, X):
        return np.array([self.predict_one(self.root, x) for x in X])

class RandomForestRegressorCustom:
    def __init__(self, n_estimators=35, max_depth=10, min_samples_split=4, max_features='sqrt', random_state=42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.random_state = random_state
        self.trees = []

    def fit(self, X, y):
        if self.random_state is not None:
            np.random.seed(self.random_state)
            random.seed(self.random_state)

        n_samples, n_features = X.shape
        if self.max_features == 'sqrt':
            max_feat = max(1, int(np.sqrt(n_features)))
        elif self.max_features == 'log2':
            max_feat = max(1, int(np.log2(n_features)))
        elif isinstance(self.max_features, int):
            max_feat = self.max_features
        else:
            max_feat = n_features

        self.trees = []
        for _ in range(self.n_estimators):
            # Bootstrap sample
            boot_idx = np.random.choice(n_samples, size=n_samples, replace=True)
            tree = DecisionTreeRegressorCustom(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=max_feat
            )
            tree.fit(X[boot_idx], y[boot_idx])
            self.trees.append(tree)

        return self

    def predict(self, X):
        tree_preds = np.array([tree.predict(X) for tree in self.trees])
        return np.mean(tree_preds, axis=0)

    def to_dict(self):
        return {
            "model_type": "RandomForestRegressor",
            "n_estimators": len(self.trees),
            "max_depth": self.max_depth,
            "trees": [t.root.to_dict() for t in self.trees]
        }

    @classmethod
    def from_dict(cls, data):
        rf = cls(n_estimators=data["n_estimators"], max_depth=data.get("max_depth", 10))
        rf.trees = []
        for t_dict in data["trees"]:
            tree = DecisionTreeRegressorCustom(max_depth=data.get("max_depth", 10))
            tree.root = DecisionTreeNode.from_dict(t_dict)
            rf.trees.append(tree)
        return rf
