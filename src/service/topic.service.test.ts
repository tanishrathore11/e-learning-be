import { topicService } from "./topic.service.js";
import { topicRepository } from "../database/repository/topic.repository.js";
import { AppError } from "../utils/appError.js";

// Mock the repository so we don't need a real database
jest.mock("../database/repository/topic.repository.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// -------------------------------------------------------------------
// createTopic
// -------------------------------------------------------------------
describe("topicService.createTopic", () => {
  it("should create and return the new topic if the name is unique", async () => {
    // Simulate: no existing topic found
    (topicRepository.findTopicByName as jest.Mock).mockResolvedValue(null);

    const mockCreatedTopic = { id: "topic-1", name: "JavaScript" };
    (topicRepository.createTopic as jest.Mock).mockResolvedValue(mockCreatedTopic);

    const result = await topicService.createTopic({ name: "JavaScript" });

    expect(topicRepository.findTopicByName).toHaveBeenCalledWith("JavaScript");
    expect(topicRepository.createTopic).toHaveBeenCalledWith({ name: "JavaScript" });
    expect(result).toEqual(mockCreatedTopic);
  });

  it("should throw AppError 409 if a topic with that name already exists", async () => {
    // Simulate: topic already exists
    (topicRepository.findTopicByName as jest.Mock).mockResolvedValue({ id: "topic-1", name: "JavaScript" });

    // We expect the service to throw, so we use .rejects
    await expect(topicService.createTopic({ name: "JavaScript" })).rejects.toThrow(AppError);
    await expect(topicService.createTopic({ name: "JavaScript" })).rejects.toThrow(
      'Topic with name "JavaScript" already exists'
    );

    // createTopic on the repo should NEVER be called if duplicate is found
    expect(topicRepository.createTopic).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// getCoursesByTopic
// -------------------------------------------------------------------
describe("topicService.getCoursesByTopic", () => {
  it("should return courses for a valid topic", async () => {
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue({ id: "topic-1", name: "JavaScript" });

    const mockCourses = [{ id: "course-1", title: "Learn JS" }];
    (topicRepository.getCourseByTopicId as jest.Mock).mockResolvedValue(mockCourses);

    const result = await topicService.getCoursesByTopic("topic-1");

    expect(topicRepository.getTopicById).toHaveBeenCalledWith("topic-1");
    expect(topicRepository.getCourseByTopicId).toHaveBeenCalledWith("topic-1");
    expect(result).toEqual(mockCourses);
  });

  it("should throw AppError 404 if the topic does not exist", async () => {
    // Simulate: topic not found
    (topicRepository.getTopicById as jest.Mock).mockResolvedValue(null);

    await expect(topicService.getCoursesByTopic("bad-id")).rejects.toThrow(AppError);
    await expect(topicService.getCoursesByTopic("bad-id")).rejects.toThrow("Topic not found");

    // getCourseByTopicId should never run if topic is missing
    expect(topicRepository.getCourseByTopicId).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// getAllTopics
// -------------------------------------------------------------------
describe("topicService.getAllTopics", () => {
  it("should return all topics", async () => {
    const mockTopics = [{ id: "topic-1", name: "JavaScript" }];
    (topicRepository.getAllTopic as jest.Mock).mockResolvedValue(mockTopics);

    const result = await topicService.getAllTopics();
    expect(result).toEqual(mockTopics);
    expect(topicRepository.getAllTopic).toHaveBeenCalled();
  });
});
