# LittleX: A Minimalistic Social Media Platform Prototype

LittleX is a lightweight social media application developed using the **Jaseci Stack**. It serves as a demonstration of how Jaseci Stack can be utilized to build scalable and intelligent applications.

## **About LittleX**

LittleX is a minimalistic implementation of a **social media platform** that showcases the capabilities of the Jaseci Stack. It includes features such as:

1. **User Profiles**:
   - Create and manage user accounts.
   - Follow other users and track relationships.

2. **Tweets**:
   - Post, view, and interact with tweets.

3. **Comments and Likes**:
   - Engage with tweets through comments and likes.

4. **AI-Powered Features**:
   - Use GPT-4o for summarizing tweets.
   - Perform **semantic search** on tweets using SentenceTransformer embeddings.

## **LittleX Architecture**

![Architecture](Documentation/images/Architecture.png)

## **Setting Up the Environment**

To run LittleX, ensure you have the following dependencies installed:

- **Jaseci**: The core framework for building graph-based applications.
- **Jac**: The programming language used to define the application's logic.
- **OpenAI's GPT-4o**: For generating tweet summaries and other textual insights.
- **SentenceTransformer**: For generating embeddings to perform semantic search.
- **Python's `logging` library**: For logging key operations and providing real-time feedback.

Install dependencies with:

```bash
pip install jaseci openai sentence-transformers
```



