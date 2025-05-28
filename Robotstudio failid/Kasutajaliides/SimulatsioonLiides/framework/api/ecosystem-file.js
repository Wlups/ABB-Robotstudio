import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

export const factoryApiFile = function (f) {
  /**
   * The API.FILESYSTEM class provides a set of interfaces for managing the file system on the controller.
   * It includes methods for retrieving file and directory contents, creating, updating, and deleting files or directories, and checking file existence.
   * This class simplifies file system operations, enabling developers to efficiently interact with and manage files on the controller.
   * @alias API.FILESYSTEM
   * @namespace
   */
  f.FILESYSTEM = new (function () {
    const fixPath = function (path) {
      return `${path.replace(/^HOME/, '$HOME').replace(/:$/, '')}/`;
    };

    const _getFile = async function (path) {
      return await RWS.FileSystem.getFile(path);
    };

    const _getDirectory = async function (path) {
      return await RWS.FileSystem.getDirectory(path);
    };

    /**
     * Get the content of a file a a string
     * @alias getDirectoryContents
     * @memberof API.FILESYSTEM
     * @param  {string} path Path to the file, including file name
     * @example
     * // Get the content of the TEMP directory of controller
     * await API.FILESYSTEM.getDirectoryContents("$TEMP")
     */
    this.getDirectoryContents = async function (path = '$HOME') {
      try {
        var directory = await _getDirectory(path);
        var contents = await directory.getContents();

        let names = {directories: [], files: []};
        for (let item of contents.directories) {
          names.directories.push(item.name);
        }

        for (let item of contents.files) {
          names.files.push(item.name);
        }
        return names;
      } catch (e) {
        return API.rejectWithStatus(`Failed to get content of ${path} directory`, e);
      }
    };

    /**
     * Get the content of a file as a string
     * @alias getFile
     * @memberof API.FILESYSTEM
     * @param  {string} path Path to the file, optional - including file name
     * @param  {string} file Name of the file
     * @example
     * // Get the file content of the file EIO.cfg in Home directory
     * await API.FILESYSTEM.getFile("$HOME","EIO.cfg")
     */
    this.getFile = async function (path, file) {
      let url = `${path.replace(/:$/, '').replace(/^HOME/, '$HOME')}${file ? `/${file}` : ''}`;
      try {
        let f = await RWS.FileSystem.getFile(url);
        return await f.getContents();
      } catch (e) {
        return API.rejectWithStatus(`Failed to get content of ${url}.`);
      }
    };

    /**
     * Get a list of files objects including name and content
     * @alias getFiles
     * @memberof API.FILESYSTEM
     * @param  {string} path Path to the file, including file name
     * @returns {Promise<object[]>} - Array of file objects [ {name, content}]
     * @example
     * await API.FILESYSTEM.getFiles("$HOME")
     */
    this.getFiles = async function (path) {
      const directory = await _getDirectory(path);
      const directoryContent = await directory.getContents();

      const data = [];
      for (let i = 0; i < directoryContent.files.length; i++) {
        const name = directoryContent.files[i].name;
        const file = await _getFile(`${path}/${name}`);
        const fileContent = await file.getContents();
        data.push({name, content: JSON.parse(fileContent)});
      }
      return data;
    };

    /**
     * Update the file content
     * @alias updateFile
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @param  {string} fileName fileName
     * @param  {string} data content to be updated
     * @returns {Promise<object[]>} - Array of file objects [ {name, content}]
     * @example
     * await API.FILESYSTEM.updateFile("$HOME","test.txt","testcontent")
     */
    this.updateFile = async function (directoryPath, fileName, data) {
      const file = await _getFile(`${directoryPath}/${fileName}`);
      const setContentStatus = await file.setContents(data);
      if (setContentStatus) {
        return await file.save(true);
      }
      return API.rejectWithStatus('Error while updating file content');
    };

    /**
     * Create a new directory
     * @alias createDirectory
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @example
     * await API.FILESYSTEM.createDirectory("$HOME/testFolder")
     */
    this.createDirectory = async function (directoryPath) {
      let dir = directoryPath.replace(/:$/, '').replace(/^HOME/, '$HOME');
      let parts = dir.split('/');

      let pathSoFar = '$HOME';
      let startIndex = parts[0] === '$HOME' ? 1 : 0;
      for (let i = startIndex; i < parts.length; i++) {
        pathSoFar += '/' + parts[i];
        try {
          await RWS.FileSystem.createDirectory(pathSoFar);
        } catch (e) {
          if (e && e.httpStatus && e.httpStatus.code == 409) {
            // the directory is already created
          } else {
            console.error(e);
            return API.rejectWithStatus(`Creating ${pathSoFar} directory failed`, e);
          }
        }
      }
    };

    /**
     * Create a new file
     * @alias createNewFile
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @param  {string} fileName file name
     * @param  {string} data data content
     * @param  {boolean} overwrite Overwrite if the file already exists
     * @example
     * await API.FILESYSTEM.createNewFile("$HOME", "test.txt", "test new", true)
     */
    this.createNewFile = async function (directoryPath, fileName, data, overwrite = false) {
      try {
        const directory = await _getDirectory(directoryPath);
        const newFile = await directory.createFileObject(fileName);
        const fileExists = await newFile.fileExists();

        if (fileExists) {
          if (overwrite) await this.updateFile(directoryPath, fileName, data);
          else throw new Error(`Create new file failed since file already exists and overwrite equals false.`);
        } else {
          const setContentStatus = await newFile.setContents(data);
          if (setContentStatus) {
            return await newFile.save(false);
          }
        }
      } catch (e) {
        return API.rejectWithStatus(`Creating ${directoryPath}/${fileName} file failed`, e);
      }
    };

    /**
     * Create a new file
     * @alias fileExists
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @param  {string} fileName file name
     * @param  {string} data data content
     * @param  {boolean} overwrite Overwrite if the file already exists
     * @example
     * await API.FILESYSTEM.fileExists("$HOME", "test.txt")
     */
    this.fileExists = async function (directoryPath, fileName) {
      try {
        const directory = await _getDirectory(directoryPath);
        const newFile = await directory.createFileObject(fileName);
        return await newFile.fileExists();
      } catch (e) {
        return false;
      }
    };

    /**
     * Delete file
     * @alias deleteFile
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @param  {string} fileName file name
     * @example
     * await API.FILESYSTEM.deleteFile("$HOME", "test.txt")
     */
    this.deleteFile = async function (directoryPath, fileName) {
      const file = await _getFile(`${directoryPath}${fileName ? `/${fileName}` : ''}`);
      return await file.delete();
    };

    /**
     * Delete directory
     * @alias deleteDirectory
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @example
     * await API.FILESYSTEM.deleteDirectory("$HOME/testFolder")
     */
    this.deleteDirectory = async function (directoryPath) {
      try {
        const dir = await _getDirectory(directoryPath);
        return await dir.delete();
      } catch (error) {
        console.warn(`API.FILESYSTEM.deleteDirectory ${directoryPath}`, 'Directory not found, nothing to delete.');
      }
    };

    /**
     * Delete all directories and files in a directory
     * @alias deleteDirectoryContent
     * @memberof API.FILESYSTEM
     * @param  {string} directoryPath directory path
     * @example
     * await API.FILESYSTEM.deleteDirectoryContent("$HOME/testFolder")
     */
    this.deleteDirectoryContent = async function (directoryPath) {
      try {
        const dirContent = await this.getDirectoryContents(directoryPath);
        if (!dirContent) return;
        if (dirContent.directories && dirContent.directories.length > 0) {
          for (const dir of dirContent.directories) {
            const dirObject = await _getDirectory(`${directoryPath}/${dir}`);
            await dirObject.delete();
          }
        }
        for (let file of dirContent.files) {
          await API.FILESYSTEM.deleteFile(directoryPath, file);
        }
      } catch (e) {
        return API.rejectWithStatus(`Deleting content of ${directoryPath} directory failed`, e);
      }
    };

    /**
     * Delete all directories and files in a directory
     * @alias copy
     * @memberof API.FILESYSTEM
     * @param  {string} source source path
     * @param  {string} destination destination path
     * @param  {boolean} overwrite overwrite if already existed in destination
     * @example
     * await API.FILESYSTEM.copy("$HOME/EIO.cfg","$HOME/WebApps/EIO.cfg")
     */
    this.copy = async function (source, destination, overwrite = false) {
      const srcFile = RWS.FileSystem.createFileObject(source);
      const destFile = RWS.FileSystem.createFileObject(destination);
      if ((await destFile.fileExists()) && !overwrite) {
        return API.rejectWithStatus(
          `Copy file failed since destination file already exists and overwrite equals false.`,
        );
      }
      return await srcFile.copy(destination, overwrite, false);
    };
  })();

  f.constructedFile = true;
};

if (typeof API.constructedFile === 'undefined') {
  factoryApiFile(API);
}

export default API;
