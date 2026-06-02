import { GitHubIntegration, GitHubRepo, GitHubCommit } from "../models/GitHub.js";

const GITHUB_API_BASE = "https://api.github.com";

export async function connectGitHub(req, res) {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Authorization code required" });
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description });
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = await userResponse.json();

    const existingIntegration = await GitHubIntegration.findOne({ user: userId });

    if (existingIntegration) {
      existingIntegration.githubAccessToken = accessToken;
      existingIntegration.githubId = String(githubUser.id);
      existingIntegration.login = githubUser.login;
      existingIntegration.name = githubUser.name;
      existingIntegration.email = githubUser.email;
      existingIntegration.avatarUrl = githubUser.avatar_url;
      existingIntegration.bio = githubUser.bio;
      existingIntegration.company = githubUser.company;
      existingIntegration.location = githubUser.location;
      existingIntegration.blog = githubUser.blog;
      existingIntegration.publicRepos = githubUser.public_repos;
      existingIntegration.followers = githubUser.followers;
      existingIntegration.following = githubUser.following;
      existingIntegration.connectedAt = new Date();
      existingIntegration.isActive = true;

      await existingIntegration.save();
    } else {
      await GitHubIntegration.create({
        user: userId,
        githubAccessToken: accessToken,
        githubId: String(githubUser.id),
        login: githubUser.login,
        name: githubUser.name,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio,
        company: githubUser.company,
        location: githubUser.location,
        blog: githubUser.blog,
        publicRepos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
      });
    }

    res.status(200).json({
      success: true,
      message: "GitHub connected successfully",
      login: githubUser.login,
    });
  } catch (error) {
    console.error("Error connecting GitHub:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function disconnectGitHub(req, res) {
  try {
    const userId = req.user._id;

    await GitHubIntegration.findOneAndUpdate(
      { user: userId },
      { isActive: false, githubAccessToken: null }
    );

    res.status(200).json({ success: true, message: "GitHub disconnected" });
  } catch (error) {
    console.error("Error disconnecting GitHub:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getGitHubStatus(req, res) {
  try {
    const userId = req.user._id;

    const integration = await GitHubIntegration.findOne({ user: userId, isActive: true });

    if (!integration) {
      return res.status(200).json({ success: true, connected: false });
    }

    res.status(200).json({
      success: true,
      connected: true,
      login: integration.login,
      name: integration.name,
      avatarUrl: integration.avatarUrl,
      publicRepos: integration.publicRepos,
      followers: integration.followers,
    });
  } catch (error) {
    console.error("Error fetching GitHub status:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getRepositories(req, res) {
  try {
    const userId = req.user._id;

    const integration = await GitHubIntegration.findOne({ user: userId, isActive: true })
      .select("githubAccessToken");

    if (!integration) {
      return res.status(403).json({ message: "GitHub not connected" });
    }

    const reposResponse = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
      headers: {
        Authorization: `Bearer ${integration.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const repos = await reposResponse.json();

    const formattedRepos = repos.map(repo => ({
      githubId: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
    }));

    await GitHubIntegration.findOneAndUpdate(
      { user: userId },
      {
        repos: formattedRepos,
        lastSyncAt: new Date(),
      }
    );

    res.status(200).json({ success: true, repositories: formattedRepos });
  } catch (error) {
    console.error("Error fetching repositories:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getCommits(req, res) {
  try {
    const userId = req.user._id;
    const { owner, repo, perPage = 30 } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ message: "Owner and repo required" });
    }

    const integration = await GitHubIntegration.findOne({ user: userId, isActive: true })
      .select("githubAccessToken");

    if (!integration) {
      return res.status(403).json({ message: "GitHub not connected" });
    }

    const commitsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${integration.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const commits = await commitsResponse.json();

    const formattedCommits = commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
      },
      url: commit.html_url,
    }));

    res.status(200).json({ success: true, commits: formattedCommits });
  } catch (error) {
    console.error("Error fetching commits:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createRepository(req, res) {
  try {
    const userId = req.user._id;
    const { name, description, private: isPrivate, autoInit } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Repository name required" });
    }

    const integration = await GitHubIntegration.findOne({ user: userId, isActive: true })
      .select("githubAccessToken");

    if (!integration) {
      return res.status(403).json({ message: "GitHub not connected" });
    }

    const createResponse = await fetch(`${GITHUB_API_BASE}/user/repos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate || false,
        auto_init: autoInit || false,
      }),
    });

    const repo = await createResponse.json();

    if (!createResponse.ok) {
      return res.status(400).json({ message: repo.message || "Failed to create repository" });
    }

    res.status(201).json({
      success: true,
      repository: {
        githubId: String(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.html_url,
        defaultBranch: repo.default_branch,
      },
    });
  } catch (error) {
    console.error("Error creating repository:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function pushCode(req, res) {
  try {
    const userId = req.user._id;
    const { owner, repo, path, content, message, branch = "main" } = req.body;

    if (!owner || !repo || !path || !content || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const integration = await GitHubIntegration.findOne({ user: userId, isActive: true })
      .select("githubAccessToken login");

    if (!integration) {
      return res.status(403).json({ message: "GitHub not connected" });
    }

    const fileResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${integration.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let sha = null;
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      sha = fileData.sha;
    }

    const encodedContent = Buffer.from(content).toString("base64");

    const putResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${integration.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: encodedContent,
          sha,
          branch,
        }),
      }
    );

    const result = await putResponse.json();

    if (!putResponse.ok) {
      return res.status(400).json({ message: result.message || "Failed to push code" });
    }

    res.status(200).json({
      success: true,
      commit: {
        sha: result.commit.sha,
        message: result.commit.message,
        url: result.commit.html_url,
      },
    });
  } catch (error) {
    console.error("Error pushing code:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserActivity(req, res) {
  try {
    const userId = req.user._id;

    const integration = await GitHubIntegration.findOne({ user: userId, isActive: true })
      .select("githubAccessToken login");

    if (!integration) {
      return res.status(403).json({ message: "GitHub not connected" });
    }

    const eventsResponse = await fetch(
      `${GITHUB_API_BASE}/users/${integration.login}/events?per_page=20`,
      {
        headers: {
          Authorization: `Bearer ${integration.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const events = await eventsResponse.json();

    const pushEvents = events
      .filter(e => e.type === "PushEvent")
      .slice(0, 10)
      .map(e => ({
        type: e.type,
        repo: e.repo.name,
        commits: e.payload.commits?.length || 0,
        date: e.created_at,
      }));

    res.status(200).json({ success: true, activity: pushEvents });
  } catch (error) {
    console.error("Error fetching user activity:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
