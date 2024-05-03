const user = {
  _id: 1111,
  name: "User 1",
  email: "user1@abc.com",
  password: "abc",
  preferences: {
    selectedLanguageIds: [222],
    // Other perfernces
  },
};

const language = {
  _di: 222,
  name: "English",
  courses: ["c1", "c2", "c3"], // Course Ids
};

const course = {
  _id: "c1",
  title: "Basics 1",
  description: "First part of basics path of english lang",
  langId: 222,
  level: 1,
  contents: {
    youtubeVideoSrcId: "L2vS_050c-M",
    audioSrc: "https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav",
    textContent: "", // Planing to have content in markdown format so I can render it as is
  },
};

const tracking = {
  _id: 4444,
  courseId: "c1",
  userId: 1111,
  status: 1, // Enum 0 - not started, 1 - in progress, 2 - completed
};
