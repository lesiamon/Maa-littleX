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

5. **Cloud Deployment**:
   - Deploy workflows, walkers, and AI features to **Jac Cloud** for seamless scaling and execution.

## **LittleX Architecture**

![Architecture](Documentation/images/Architecture.png)

## **Setting Up the Environment**

To run LittleX, ensure you have the following dependencies installed:

- **Jac**: The programming language used to define the application's logic.
- **Jac Cloud**: Hosted execution environment for Jaseci applications.
- **Splice-ORC**: Create advanced workflows by orchestrating multiple tools and APIs with LLMs.


Install dependencies with:

```bash
pip install jac jac-cloud splice-orc
```



