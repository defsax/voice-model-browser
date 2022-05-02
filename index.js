(async () => {
  let classifier = new EdgeImpulseClassifier();
  let audio = new Audio();

  await classifier.init();
  await audio.getUserData(classifier);
})();
