const mapperFunction = (
  data,
  fs,
  subjects = [],
  questions = [],
  answers = []
) => {
  const removedItemName = data.map((item) => item.Item);
  fs.writeFileSync("./log/dynamo-logs.js", JSON.stringify(removedItemName));
  const removedValuePrefix = removedItemName.map((item) => {
    let mappedData;

    if (
      "finalThank" in item ||
      ("recordType" in item && item.recordType.S === "subject")
    ) {
      const {
        finalThank,
        visibility,
        createdAt,
        name,
        descriptionNative,
        code,
        subjectId,
        categoryId,
        organizationId,
        sort,
        end,
        description,
        introduction,
        nameNative,
        recordType,
        start,
      } = item;

      mappedData = {
        finalThank: finalThank?.S,
        visibility: visibility?.S,
        createdAt: createdAt?.S,
        name: name?.S,
        descriptionNative: descriptionNative?.NULL ?? descriptionNative?.S,
        code: code?.S,
        subjectId: subjectId?.S,
        categoryId: categoryId?.S,
        organizationId: organizationId?.S,
        end: end?.S,
        description: description?.S,
        introduction: introduction?.S,
        nameNative: nameNative?.NULL ?? nameNative?.S,
        recordType: recordType?.S,
        start: start?.S,
        tableName: "subjects",
      };

      subjects.push(mappedData);
    } else if (
      "isRequired" in item ||
      ("recordType" in item && item.recordType.S === "question")
    ) {
      const {
        content,
        questionId,
        isRequired,
        status,
        createdAt,
        subjectId,
        organizationId,
        title,
        type,
        questionAnswers,
      } = item;

      mappedData = {
        subjectId: subjectId?.S,
        questionId: questionId?.S,
        title: title?.S,
        content: content?.S,
        isRequired: isRequired?.BOOL,
        status: status?.S,
        organizationId: organizationId?.S,
        createdAt: createdAt?.S,
        tableName: "questions",
        type: type?.S,
        questionAnswers: questionAnswers?.L.map((data) => {
          const mapped = {
            content: data.M.content.S,
          };
          return mapped;
        }),
      };
      questions.push(mappedData);
    } else if ("userAnswerId" in item) {
      const {
        userAnswerId,
        questionId,
        subjectId,
        userAnswers,
        createdAt,
        userId,
      } = item;

      mappedData = {
        answerId: userAnswerId?.S,
        questionId: questionId?.S,
        subjectId: subjectId?.S,
        userAnswers: {
          type: userAnswers?.M?.type?.S,
          answer: userAnswers?.L?.map((data) => {
            const mappedData = {
              content: data.M.content.S,
            };
            return mappedData;
          }),
        },
        createdAt: createdAt?.S,
        userId: userId?.S,
        tableName: "answers",
      };
      answers.push(mappedData);
    } else {
      return undefined;
    }
    return mappedData;
  });

  const mutataedQuestions = questions.map((item) => {
    if (!subjects.some((subject) => subject.subjectId === item.subjectId)) {
      return { ...item, subjectId: "" };
    }
    return item;
  });

  const mutatedAnswers = answers.map((item) => {
    if (
      !questions.some((question) => question.questionId === item.questionId)
    ) {
      return { ...item, questionId: "" };
    }
    return item;
  });

  fs.writeFileSync(
    "./log/subjects/subject.mjs",
    "export default" + JSON.stringify(subjects)
  );
  fs.writeFileSync(
    "./log/questions/question.mjs",
    "export default" + JSON.stringify(mutataedQuestions)
  );
  fs.writeFileSync(
    "./log/answers/answer.mjs",
    "export default" + JSON.stringify(mutatedAnswers)
  );

  fs.writeFileSync(
    "./log/data.mjs",
    "export default" + JSON.stringify(removedValuePrefix)
  );
};

export default mapperFunction;
