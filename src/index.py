from datetime import datetime
import json
from pytz import timezone
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier as RFC
from sklearn.model_selection import train_test_split
import pandas as pd
from sklearn.metrics import classification_report

def handler(event, context):
    tokyo_dt = datetime.now(timezone('Asia/Tokyo'))
    # データを読み込む
    cancer = load_breast_cancer()
    X = cancer.data
    y = cancer.target
    df = pd.DataFrame(X, columns=cancer.feature_names)  
    df['target'] = y
    df_x = df.drop("target",axis=1)
    df_y = df["target"]

    # モデルの学習
    model = RFC(random_state=0)
    x_train,x_val,y_train,y_val = train_test_split(df_x, df_y, test_size=0.3, random_state=0)
    model.fit(x_train, y_train)
    y_pred = model.predict(x_val)

    # 評価指標の取得
    accuracy = model.score(x_val, y_val)
    report = classification_report(y_val, y_pred, output_dict=True)

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Model trained successfully',
            'timestamp': tokyo_dt.strftime('%Y-%m-%d %H:%M:%S'),
            'accuracy': accuracy,
            'classification_report': report
        }, ensure_ascii=False)
    }

