from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

# Database connection
db = pymysql.connect(
    host='localhost',
    user='root',
    password='flori',
    database='exams',
)


@app.route('/api/go2exam', methods=['POST'])
def go2exam():
    email = request.json.get('email')
    name = request.json.get('name')
    fingerprint = request.json.get('fingerprint')
    cursor = db.cursor()
    cursor.execute(
        'SELECT id, type, name, browserid FROM users WHERE email = %s', (email))
    datasetUsers = cursor.fetchall()
    msg = {}
    if len(datasetUsers) == 1:
        row = datasetUsers[0]
        uid = row[0]
        browserid = row[3]
        if browserid != None and len(browserid) > 5 and browserid != fingerprint:
            msg = {
                'success': False,
                'error_msg': "Je i lidhur tashmë me një pajisje/browser tjetër!"
            }
            return jsonify(msg)
        cursor.execute(
            "update users set name = %s, browserid = %s where id = %s", (name, fingerprint, uid))
        cursor.execute(
            'SELECT id, start_date, end_date, duration, status, total_point FROM test WHERE active = 1')
        datasetTest = cursor.fetchall()
        if len(datasetTest) == 1:
            test = datasetTest[0]
            tid = test[0]
            start_date = test[1]
            end_date = test[2]
            duration = test[3]
            status = test[4]
            total_points = test[5]

            insert_user_tests = "select test_id,user_points,completed from user_tests where user_id = %s and test_id = %s"
            user_test_row = cursor.execute(insert_user_tests, (uid, tid))
            if user_test_row is None:
                user_test_row = cursor.execute(insert_user_tests, (uid, tid))
            elif user_test_row == 1:
                usrRec = cursor.fetchone()
                completed = usrRec[2]
                points = usrRec[1]
                questions = getQuestions(cursor, uid, tid)

                exam = {
                    'user': {
                        'uid': uid,
                        'email': email,
                        'user_name': name,
                    },
                    'tid': tid,
                    'points': points,
                    'completed': completed,
                    'start_date': start_date.strftime("%Y-%m-%d %H:%M:%S"),
                    'end_date': end_date.strftime("%Y-%m-%d %H:%M:%S"),
                    'duration': duration,
                    'total_points': total_points,
                    'status': status,
                    'questions': [
                        {'id': q[1], 'qid': q[0], 'type': q[2], 'json': q[3], 'no': q[4], 'done': q[5], 'answer': q[6], 'media_id': q[7]} for q in questions
                    ],
                    'answers': [
                        {'qid': q[1], 'answer': q[6]} for q in questions if q[5] == True
                    ],
                    'media': []
                }
                msg = {
                    'success': True, 'error_msg': "",
                    "exam": exam, "user": name, "uid": uid
                }
            else:
                msg = {
                    'success': False,
                    'error_msg': "Can't create new test session!"
                }

        elif len(datasetUsers) > 1:
            msg = {'success': False, 'error_msg': "More than 1 test active"}
        else:
            msg = {'success': False, 'error_msg': "No active test!"}

    elif len(datasetUsers) > 1:
        msg = {
            'success': False,
            'error_msg': "More than 1 student register with this email"
        }
    else:
        cursor.execute('SELECT uuid()')
        firsRow = cursor.fetchone()
        uid = firsRow[0]
        insert_user = "INSERT INTO users (id, type, email, name, browserid) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(insert_user, (uid, 'student', email, name, fingerprint))
        cursor.execute(
            'SELECT id, start_date, end_date, duration, status, total_point FROM test WHERE active = 1')
        datasetTest = cursor.fetchall()
        if len(datasetTest) == 1:
            test = datasetTest[0]
            tid = test[0]
            start_date = test[1]
            end_date = test[2]
            duration = test[3]
            status = test[4]
            total_points = test[5]
            insert_user_tests = "INSERT INTO user_tests (user_id, test_id) VALUES ( %s, %s)"
            cursor.execute(insert_user_tests, (uid, tid))
            questions = getQuestions(cursor, uid, tid)
            medias = getMedias(cursor, tid)
            exam = {
                'user': {
                    'uid': uid,
                    'email': email,
                    'user_name': name,
                },
                'tid': tid,
                'points': 0,
                'completed': 0,
                'start_date': start_date.strftime("%Y-%m-%d %H:%M:%S"),
                'end_date': end_date.strftime("%Y-%m-%d %H:%M:%S"),
                'duration': duration,
                'status': status,
                'total_points': total_points,
                'questions': [
                    {'id': q[1], 'qid': q[0], 'type': q[2], 'json': q[3], 'no': q[4], 'done': q[5], 'answer': q[6], 'media_id': q[7]} for q in questions
                ],
                'answers': [
                    {'qid': q[1], 'answer': q[6]} for q in questions if q[5] == True
                ],
                'media': [{'media_id': m[0], "content": m[1], "type": m[2], "filename": m[3]} for m in medias]
            }
            msg = {
                'success': True, 'error_msg': "",
                "exam": exam, "user": name, "uid": uid
            }
        elif len(datasetUsers) > 1:
            msg = {'success': False, 'error_msg': "More than 1 test active"}
        else:
            msg = {'success': False, 'error_msg': "No active test!"}

    db.commit()
    cursor.close()
    return jsonify(msg)


def getQuestions(cursor, uid, tid):
    str_to_exec = f"""
        select q.id as question_id, tq.id as test_question_id,
            q.type, q.data, q.norder, case when ua.answer is null then 0 else 1 end as is_answered, ua.answer, q.media_id
        from users u
        join user_tests ut on u.id = ut.user_id
        join test t on t.id = ut.test_id
        join test_question tq on tq.test_id = t.id
        join question q on q.id = tq.question_id
        left outer join user_answers ua on tq.id = ua.test_question_id and u.id = ua.user_id 
        where u.id = '{uid}' and t.id =  '{tid}' """
    cursor.execute(str_to_exec)

    return cursor.fetchall()


def getMedias(cursor, tid):
    cursor.execute(
        f"""select id, content, type, fileName 
            from media where id in (select media_id 
                                    from question 
                                    where id in (select question_id from test_question where test_id = '{tid}'))"""
    )
    return cursor.fetchall()


@app.route('/api/submitexam', methods=['POST'])
def submitexam():
    cursor = db.cursor()
    tid = request.json.get('tid')
    uid = request.json.get('uid')
    answers = request.json.get('answers')
    stm_select_user_test = "select test_id,user_points,completed from user_tests where user_id = %s and test_id = %s"
    user_tests = cursor.execute(stm_select_user_test, (uid, tid))
    if user_tests is None:
        msg = {'success': False, 'completed': 0, "msg": "Internal Server Error!", 'pointsTotal': 0}
        return jsonify(msg)
    elif user_tests == 1:
        usrRec = cursor.fetchone()
        completed = usrRec[2]
        points = usrRec[1]
        if completed == 1:
            msg = {'success': True, 'completed': 1, "msg": "E ke perfunduar kete test!", 'pointsTotal': points}
            return jsonify(msg)
        else:
            if (isinstance(answers, list)):
                for answ in answers:
                    answer = answ['answer']
                    qid = answ['qid']
                    cursor.execute(
                        "select question_id from test_question where test_id =  %s and id =  %s", (tid, qid))
                    questionTestCursor = cursor.fetchone()
                    qtid = questionTestCursor[0]
                    cursor.execute(
                        "select type, correct_answer, point from question where id =  %s", (qtid))
                    questionCursor = cursor.fetchone()
                    qtype = questionCursor[0]
                    qansw = questionCursor[1]
                    qpoint = questionCursor[2]

                    cursor.execute(
                        "select user_id from user_answers where user_id =  %s and test_question_id =  %s", (uid, qid))
                    answCheck = cursor.fetchone()
                    existsANS = True if answCheck else False
                    point = 0
                    if qtype == 'multiple':
                        arr_corr = qansw.split(",")
                        arr_answ = answer.split(",")
                        arr_answ = [item for item in arr_answ if item.strip()]
                        correctA = len(list(set(arr_answ) & set(arr_corr)))
                        notCorrectA = len([x for x in arr_answ if x not in arr_corr])
                        totalA = correctA - notCorrectA
                        if totalA > 0:
                            point = round((totalA / len(arr_corr)) * qpoint)
                    else:
                        point += qpoint if answer == qansw else 0

                    if existsANS:
                        if len(answer) == 0:
                            cursor.execute(
                                "delete from user_answers where test_question_id = %s and user_id = %s ", (qtid, uid))
                        else:
                            cursor.execute("update user_answers set answer = %s, is_correct = %s , points = %s, answer_date = CURRENT_TIMESTAMP() where test_question_id = %s and user_id = %s ", (
                                answer, 1 if point > 0 else 0, point, qid, uid))
                    else:
                        if len(answer) > 0:
                            cursor.execute("insert into user_answers(answer, is_correct, points, test_question_id, user_id, answer_date) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP()) ", (
                                answer, 1 if point > 0 else 0, point, qid, uid))

                cursor.execute("""update user_tests ut set
                                user_points = IFNULL((select sum(points) 
                                                        from user_answers ua 
                                                        where user_id = %s and test_question_id in ( select id from test_question where test_id = %s )),0),
                                completed = case when (select count(*) 
                                                        from user_answers ua 
                                                        where user_id = %s and test_question_id in ( select id from test_question where test_id = %s )) = ( select count(*) from test_question where test_id = %s ) then 1 else 0 end
                                where user_id = %s and test_id = %s """, (uid, tid, uid, tid, tid, uid, tid))

                cursor.execute(
                    "select completed, user_points from user_tests where user_id = %s and test_id = %s", (uid, tid))
                user_test_row = cursor.fetchone()
                completed = user_test_row[0]
                pointsTotal = user_test_row[1]
            db.commit()
    else:
        msg = {'success': False, 'completed': 0, "msg": "Internal Server Error!", 'pointsTotal': 0}
        return jsonify(msg)
    cursor.close()
    msg = {
        'success': True, 
        'completed': completed, 
        "msg": "Ti e ke perfunduar kete test!" if completed == 1 else "Testi u ruajt me sukses!", 
        'pointsTotal': pointsTotal if completed == 1 else 0,
    }
    return jsonify(msg)


if __name__ == '__main__':
    app.run(host='0.0.0.0' , port=5000, debug=True)
