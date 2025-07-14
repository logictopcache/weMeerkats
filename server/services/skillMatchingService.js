const { spawn } = require("child_process");
const path = require("path");

class SkillMatchingService {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, "../script/skillMatcher.py");
  }

  async rankMentorsBySkills(learnerSkills, mentors, options = {}) {
    const { minScore = 0.1, maxResults = 10 } = options;

    return new Promise((resolve, reject) => {
      try {
        // Prepare data for Python script
        const learnerSkillsJson = JSON.stringify(learnerSkills);
        const mentorsJson = JSON.stringify(mentors);

        // Spawn Python process with virtual environment
        const pythonProcess = spawn(
          "python",
          [this.pythonScriptPath, learnerSkillsJson, mentorsJson],
          {
            cwd: path.dirname(this.pythonScriptPath),
            env: {
              ...process.env,
              PATH: `${path.join(
                __dirname,
                "../script/skillmatcher_env/bin"
              )}:${process.env.PATH}`,
            },
          }
        );

        let stdout = "";
        let stderr = "";

        // Collect stdout data
        pythonProcess.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        // Collect stderr data
        pythonProcess.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        // Handle process completion
        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            console.error("Python script error:", stderr);
            reject(
              new Error(`Python script failed with code ${code}: ${stderr}`)
            );
            return;
          }

          try {
            const result = JSON.parse(stdout);

            // Apply additional filtering if needed
            const filteredMentors = result.ranked_mentors
              .filter((mentor) => mentor.matching_score >= minScore)
              .slice(0, maxResults);

            resolve({
              ranked_mentors: filteredMentors,
              total_mentors_processed: result.total_mentors_processed,
              mentors_returned: filteredMentors.length,
              matching_criteria: {
                min_score: minScore,
                max_results: maxResults,
              },
            });
          } catch (parseError) {
            console.error("Error parsing Python output:", parseError);
            reject(new Error("Failed to parse Python script output"));
          }
        });

        // Handle process errors
        pythonProcess.on("error", (error) => {
          console.error("Failed to start Python process:", error);
          reject(
            new Error(`Failed to execute Python script: ${error.message}`)
          );
        });
      } catch (error) {
        reject(new Error(`Skill matching service error: ${error.message}`));
      }
    });
  }

  async getMentorMatchingScore(learnerSkills, mentor) {
    const result = await this.rankMentorsBySkills(learnerSkills, [mentor], {
      minScore: 0,
      maxResults: 1,
    });
    return result.ranked_mentors[0] || null;
  }

  async checkDependencies() {
    return new Promise((resolve) => {
      const pythonProcess = spawn("python", [
        "-c",
        'import numpy, sklearn, scipy; print("OK")',
      ]);

      pythonProcess.on("close", (code) => {
        resolve(code === 0);
      });

      pythonProcess.on("error", () => {
        resolve(false);
      });
    });
  }
}

module.exports = new SkillMatchingService();
