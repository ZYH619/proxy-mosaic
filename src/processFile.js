const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const fsPromises = fs.promises;
const { greenLog } = require("./terminalLog");
const { appendToJs } = require('./temp/index')

// 获取文件夹名称
const getLastFolderFromPath = (filePath) => {
  return path.basename(filePath);
};

// 检查目录是否存在
const checkDir = async (dirPath) => {
  console.log("🚀 ~ checkDir ~ dirPath:", dirPath);

  try {
    await fsPromises.access(dirPath, fs.constants.F_OK | fs.constants.W_OK);
    greenLog(`目录: << ${getLastFolderFromPath(dirPath)} >> 已存在`);
    return true;
  } catch (accessErr) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      greenLog(`目录:  << ${getLastFolderFromPath(dirPath)} >> 已成功创建`);
      return false;
    } catch (mkdirErr) {
      console.error(`创建目录失败: ${mkdirErr}`);
      return false;
    }
  }
};

// 获取指定文件内容
const getFileContent = (dirPath) => {
  const fileContent = require(dirPath);
  return fileContent;
};

// 校验某个文件是否存在
const doesFileExist = (filePath) => {
  return fs.existsSync(filePath)
    ? filePath
    : new Error("The file does not exist.");
};

// 拷贝文件夹至指定目录
const copyDirContents = async (src, dest) => {
  try {
    await fse.copy(src, dest, { overwrite: true });
    greenLog(
      `Front end resources << ${getLastFolderFromPath(dest)} >> are ready`
    );
  } catch (err) {
    console.error("An error occurred during the copying process:", err);
  }
};

// 校验目录是否为空
const checkDirEmpty = async (dirPath) => {
  try {
    // 获取目录下的文件和子目录列表
    const files = await fsPromises.readdir(dirPath);

    // 如果列表为空，则目录为空
    return files.length === 0;
  } catch (err) {
    // 如果目录不存在或读取目录时出错，也返回true表示认为该路径为空（可根据需求调整）
    console.error(`检查目录是否为空时发生错误: ${err.message}`);
    return true;
  }
};


// 拷贝模板内容
const copyTemplateContents = async (options) => {
  const {
    currentTemplatePath: srcDir,
    currentLocalPathCWD: destDir,
    projectName = "front",
  } = options;
  try {
    // TODO: 动画
    // 首先将模板目录下的所有内容拷贝到目标目录
    await fse.copy(srcDir, destDir, { overwrite: true });

    const outPutEdPath = `${destDir}/mosaic_project`;

    const renamingMap = {
      front_output: `${projectName}_output`,
      front_pro: `${projectName}_pro`,
    };

    // 根据重置映射表，在目标目录下进行重置操作
    await renameDirectoriesSerially(outPutEdPath, renamingMap);

    greenLog(`Templates resource << mosaic_project >> have been ready.`);
  } catch (err) {
    console.error(
      "An error occurred during the copying and/or renaming process:",
      err
    );
  }
};

// 重置目录操作
const renameDirectoriesSerially = async (dir, renamingMap) => {
  const entries = await fse.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const itemPath = path.join(dir, entry.name);
    const newName = renamingMap[entry.name];

    if (newName) {
      const newItemPath = path.join(dir, newName);
      await fse.mkdir(newItemPath, { recursive: true });
      
      newName.split("_")[1] === "output" &&
        appendToJs('newResourceOutPutPath', newItemPath, 'data')
      newName.split("_")[1] === "pro" && appendToJs('newProjectPath', newItemPath, 'data');

      // 使用move方法替代单独的创建和删除操作
      await fse.move(itemPath, newItemPath, {
        overwrite: true,
        recursive: true,
      });
    }
  }
};


module.exports = {
  checkDir,
  getFileContent,
  doesFileExist,
  copyDirContents,
  checkDirEmpty,
  copyTemplateContents,
};
