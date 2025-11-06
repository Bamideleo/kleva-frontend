import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Code, Eye, Download, Share, Settings, Maximize2, ExternalLink, Folder, FolderOpen, File, AlertTriangle, CheckCircle, Clock, RefreshCw, Edit3, Send, Plus } from 'lucide-react';
import { aiService } from '../lib/ai';
import { Link, useLocation, useNavigate} from "react-router-dom";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import Typewriter from "typewriter-effect";
import { editWebsite, publishWeb } from '../api/auth';



interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  timestamp: Date;
  error?: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export const Workspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project, prompt } = location.state || {};
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isTweakPrompt, setIsTweakPrompt] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iseditLoading, setEditIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [newPrompt, setNewPrompt] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [currentTitle, setCurrentTitle] = useState(project.title);
  const [generatedCode, setGeneratedCode] = useState({
    html: '',
    css: '',
    js: '',
    framework: ''
  });
  

  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const effectCalled = useRef(false);


  useEffect(() => {
    if (effectCalled.current) return; 
    effectCalled.current = true;
     simulate();
    // generateP(currentPrompt);
  }, []);








  const  simulate = async () => {
    setIsGenerating(true);
    
    setProcessingSteps([]);
    const steps = [
      { id: '1', title: 'Analyzing Prompt', message: 'Understanding your requirements and project scope...', status: 'processing' as const },
      { id: '2', title: 'Planning Architecture', message: 'Designing the optimal project structure and components...', status: 'pending' as const },
      { id: '3', title: 'Generating Code', message: 'Creating semantic code structure...', status: 'pending' as const },
      { id: '4', title: 'Styling Code', message: 'Applying responsive styles and animations...', status: 'pending' as const },
      { id: '5', title: 'Adding JavaScript', message: 'Implementing interactive functionality...', status: 'pending' as const },
      { id: '6', title: 'Optimizing Performance', message: 'Minifying code and optimizing assets...', status: 'pending' as const },
      { id: '7', title: 'Final Review', message: 'Running quality checks and validation...', status: 'pending' as const }
    ];

    setProcessingSteps(steps);

       try {
      for (let i = 0; i < steps.length; i++) {
        // Update current step to processing
        setProcessingSteps(prev => prev.map(step => 
          step.id === steps[i].id 
            ? { ...step, status: 'processing', timestamp: new Date() }
            : step
        ));

        // Simulate processing time
        // await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
        // await new Promise(resolve => setTimeout(resolve, 60000 + Math.random() * 10000));
        await new Promise(resolve => setTimeout(resolve, 35000 + Math.random() * 10000));

        // Randomly simulate an error for demonstration
        if (i === 3 && Math.random() < 0.3) {
          setProcessingSteps(prev => prev.map(step => 
            step.id === steps[i].id 
              ? { 
                  ...step, 
                  status: 'error', 
                  message: 'CSS compilation failed - attempting auto-fix...', 
                  error: 'Syntax error in CSS selector on line 45',
                  timestamp: new Date() 
                }
              : step
          ));

          // Auto-fix attempt
          await new Promise(resolve => setTimeout(resolve, 1500));
          setProcessingSteps(prev => prev.map(step => 
            step.id === steps[i].id 
              ? { 
                  ...step, 
                  status: 'completed', 
                  message: 'CSS compilation completed (auto-fixed syntax error)', 
                  error: undefined,
                  timestamp: new Date() 
                }
              : step
          ));
        } else {
          // Complete the step
          setProcessingSteps(prev => prev.map(step => 
            step.id === steps[i].id 
              ? { ...step, status: 'completed', timestamp: new Date() }
              : step
          ));
        }
      }
      // setIsGenerating(false);
    } catch (error) {
      console.error('Generation failed:', error);
      setProcessingSteps(prev => prev.map(step => 
        step.status === 'processing' 
          ? { ...step, status: 'error', error: 'Generation failed', timestamp: new Date() }
          : step
      ));
      setIsGenerating(false);
    }

  }

  const generatePooP = async (promptText: string, type=0, html=null, css=null, js=null) => {
    setIsGenerating(true);
    try {
      // Generate the actual code
  const result = await aiService.generateProject(promptText, type, html,css, js); 
  const files = result.files;
      setGeneratedCode(files);

      // Create file structure
      const structure: FileNode[] = [
        {
          name: 'src',
          type: 'folder',
          path: 'src',
          isOpen: true,
          children: [
            {
              name: 'index.html',
              type: 'file',
              path: 'src/index.html',
              content:files.html
            },
            {
              name: 'styles',
              type: 'folder',
              path: 'src/styles',
              isOpen: true,
              children: [
                {
                  name: 'main.css',
                  type: 'file',
                  path: 'src/styles/main.css',
                  content:files.css
                },
                {
                  name: 'components.css',
                  type: 'file',
                  path: 'src/styles/components.css',
                  content: '/* Component-specific styles */'
                }
              ]
            },
            {
              name: 'scripts',
              type: 'folder',
              path: 'src/scripts',
              isOpen: true,
              children: [
                {
                  name: 'main.js',
                  type: 'file',
                  path: 'src/scripts/main.js',
                  content: files.js
                },
                {
                  name: 'utils.js',
                  type: 'file',
                  path: 'src/scripts/utils.js',
                  content: '// Utility functions'
                }
              ]
            },
            {
              name: 'assets',
              type: 'folder',
              path: 'src/assets',
              isOpen: false,
              children: [
                {
                  name: 'images',
                  type: 'folder',
                  path: 'src/assets/images',
                  children: []
                },
                {
                  name: 'fonts',
                  type: 'folder',
                  path: 'src/assets/fonts',
                  children: []
                }
              ]
            }
          ]
        },
        {
          name: 'package.json',
          type: 'file',
          path: 'package.json',
          content: `{
  "name": "${project.slug}",
  "version": "1.0.0",
  "description": "${promptText.substring(0, 100)}",
  "main": "src/index.html",
  "scripts": {
    "start": "live-server src",
    "build": "npm run minify"
  },
  "dependencies": {
    "live-server": "^1.2.2"
  }
}`
        },
        {
          name: 'README.md',
          type: 'file',
          path: 'README.md',
          content: `# ${currentTitle}\n\n${promptText}\n\nGenerated with AIBuilder\n\n## Getting Started\n\n1. Open index.html in your browser\n2. Or run \`npm start\` for live server\n\n## Features\n\n- Responsive design\n- Modern CSS\n- Interactive JavaScript\n- SEO optimized`
        }
      ];

      setFileStructure(structure);
      setSelectedFile('src/index.html');
      
      // Create preview URL
      const blob = new Blob([createPreviewHTML(files)], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Generation failed:', error);
      setProcessingSteps(prev => prev.map(step => 
        step.status === 'processing' 
          ? { ...step, status: 'error', error: 'Generation failed', timestamp: new Date() }
          : step
      ));
      setIsGenerating(false);
    }
  };

  const handlePromptSubmit = async () => {
    if (!newPrompt.trim()) return;
    
    setCurrentPrompt(newPrompt);
    setIsEditingPrompt(false);
     simulate();
    await generateProject(newPrompt);
    setNewPrompt('');
  };

  const handleTweakPromptSubmit = async () => {
    if (!newPrompt.trim()) return;
    const type = 1;
    setCurrentPrompt(newPrompt);
    setIsTweakPrompt(false);
     simulate();
    await generateProject(newPrompt, type, generatedCode.html, generatedCode.css, generatedCode.js,);
    setNewPrompt('');
  };

  const handleEditPrompt = () => {
    setIsEditingPrompt(true);
    setNewPrompt('');
  };

  const handleTweakPrompt = () => {
     setIsTweakPrompt(true);
    setNewPrompt('');
  };

  const handleEditTitle = () =>{
    setIsEditingTitle(true);
    setNewTitle('');
  }

  const createPreviewHTML = (code: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${code.css}</style>
      </head>
      <body>
        ${code.html.replace(/<script.*<\/script>/s, '')}
        <script>${code.js}</script>
      </body>
      </html>
    `;
  };

  const toggleFolder = (path: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFileStructure(updateNode(fileStructure));
  };

  const selectFile = (path: string) => {
    setSelectedFile(path);
  };

  const getFileContent = (path: string): string => {
    const findFile = (nodes: FileNode[]): string => {
      for (const node of nodes) {
        if (node.path === path && node.type === 'file') {
          return node.content || '';
        }
        if (node.children) {
          const result = findFile(node.children);
          if (result) return result;
        }
      }
      return '';
    };
    return findFile(fileStructure);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 hover:bg-white/5 cursor-pointer rounded text-sm ${
            selectedFile === node.path ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              selectFile(node.path);
            }
          }}
        >
          {node.type === 'folder' ? (
            node.isOpen ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
          ) : (
            <File className="w-4 h-4 text-slate-400" />
          )}
          <span>{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div>
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleExport = async () => {

    const zip = new JSZip();

    const files = {
      'index.html': generatedCode.html,
      'styles.css': generatedCode.css,
      'script.js': generatedCode.js,
      'README.md': `# ${currentTitle}\n\nGenerated with AIBuilder\n\nPrompt: ${prompt}`
    };

    // Add each file to the ZIP
    Object.entries(files).forEach(([fileName, content]) => {
      zip.file(fileName, content);
    });

      try {
      // Generate the ZIP file asynchronously
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download using FileSaver
      saveAs(content, `${currentTitle || 'project'}.zip`);
      // console.log('Exporting project files:', files);
       Swal.fire({
                 toast: true,
                 icon: "success",
                 title: 'Project exported successfully!',
                 position: "top-end",
                 showConfirmButton: false,
                 timer: 3000,
               });
    } catch (error) {
      console.error('Error generating ZIP file:', error);
          Swal.fire({
                 toast: true,
                 icon: "error",
                 title: 'Failed to export project. Please try again.',
                 position: "top-end",
                 showConfirmButton: false,
                 timer: 3000,
               });
    }

    // console.log('Exporting project files:', files);
    // alert('Project exported successfully! (In production, this would download a ZIP file)');
  };

  const handleEdit = async () => {
     setEditIsLoading(true);
     // Simulate API call
       try {
         const res = await editWebsite(generatedCode.html, generatedCode.css, generatedCode.js, currentTitle, prompt);
         if(res.status === 400){
           Swal.fire({
                    toast: true,
                    icon: "success",
                    title: res.message,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                  });
         }
         else{
          
      //Open external link first (new tab)
      window.open("https://live.mykleva.com/admin/", "_blank");
      //Then redirect current tab after a short delay
      setTimeout(() => {
        navigate("/projects");
      }, 500);
          
         }
         
         
      setEditIsLoading(false); 
       } catch (err: any) {
         console.error("Failed to fetch project:", err);
       }
  

  }

  const handlePublish = async () => {
    setIsLoading(true);
   
       // Simulate API call
       try {
         const res = await publishWeb(generatedCode.html, generatedCode.css, generatedCode.js, currentTitle, prompt);
         
         if(res.status === 400 ){
           Swal.fire({
              toast: true,
              icon: "success",
              title: res.message,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
         }
         else{
          Swal.fire({
              toast: true,
              icon: "success",
              title: res.message,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });

        //  navigate('/projects');
         }

       } catch (err: any) {
         Swal.fire({
              toast: true,
              icon: "error",
              title: err.message,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
       }
       setIsLoading(false);
      
  };

  const openPreviewInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleUpdateTitle = (newTitle: string) =>{
  setCurrentTitle(newTitle);
   setNewTitle(newTitle);
  }
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-slate-900  p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/create-project"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
          <div className="flex items-center justify-between">
  <h1 className="text-lg font-semibold">
    Title {currentTitle}
  </h1>
  <button
    onClick={handleEditTitle}
    className="p-1 hover:bg-white rounded transition-colors border-slate-50"
  >
    <Edit3 className="w-4 h-4 text-slate-500 hover:text-black" />
  </button>
</div>

{isEditingTitle ? (
      <input
                  type="text"
                  name="name"
                  value={newTitle}
                    onChange={(e) => handleUpdateTitle(e.target.value)}
                    placeholder="Add new title..."
                    className="w-full px-3 py-2 bg-white/5 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-500 placeholder-slate-500 resize-none text-sm"
                 
                /> ):""
}      
    <p className="text-sm text-slate-400">Workspace</p>
        
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {previewUrl && (
            <button 
              onClick={openPreviewInNewTab}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview</span>
            </button>
          )}
          <button 
          onClick={()=> handleEdit()}
           disabled={iseditLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
          {iseditLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
              <>
            <Settings className="w-4 h-4" />
            <span>Visual Editor</span>
            </>
              )}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handlePublish}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center space-x-2"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
              <>
            <Share className="w-4 h-4" />
            <span>Publish</span>
            </>
              )
              }
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Panel - Enhanced Prompt Processing */}
        <aside className="w-96 border-r border-white/10 bg-slate-50 text-slate-500 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Project Prompt
              </h3>
              {!isGenerating && (
                <button
                  onClick={handleEditPrompt}
                  className="p-1 hover:bg-white/5 rounded transition-colors border-slate-500"
                >
                  <Edit3 className="w-4 h-4 text-slate-500 hover:text-black" />
                </button>
              )}
            </div>
            

              {isTweakPrompt ? (
              <>
              <div className="space-y-3 mt-2">
                 <div className="p-4 bg-gray-100 border border-white/10 rounded-lg">
                  <p className="text-sm text-slate-600 leading-relaxed">{currentPrompt}</p>
                </div>
                <div className="relative">
                  <textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Add additional requirements or modifications..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-500 placeholder-slate-500 resize-none text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setIsTweakPrompt(false)}
                      className="px-4 py-2 text-sm border border-gray-400 rounded-lg hover:bg-black/25 hover:border-bg-black/25  hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTweakPromptSubmit}
                      disabled={!newPrompt.trim()}
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              </div>
              
             </> 
            ) : (
              <>
              <div className="space-y-3 mt-3">
                   <div className="p-4 bg-gray-100 border border-white/10 rounded-lg">
                  <p className="text-sm text-slate-600 leading-relaxed">{currentPrompt}</p>
                </div>
                {!isGenerating && (
                  <button
                    onClick={handleTweakPrompt}
                    className="w-full p-3 border border-dashed border-gray-400 rounded-lg hover:bg-black/25 hover:border-bg-black/25   transition-colors flex items-center justify-center space-x-2 text-slate-500 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tweak/Update Prompt</span>
                  </button>
                )}
              </div>
              </> 
            )}

            {isEditingPrompt ? (
              <div className="space-y-3 mt-3">
                {/* <div className="p-4 bg-gray-100 border border-white/10 rounded-lg">
                  <p className="text-sm text-slate-600 leading-relaxed">{currentPrompt}</p>
                </div> */}
                <div className="relative">
                  <textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Add additional requirements or modifications..."
                    className="w-full h-24 px-4 py-3 bg-white/5 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-500 placeholder-slate-500 resize-none text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setIsEditingPrompt(false)}
                      className="px-4 py-2 text-sm border border-gray-400 rounded-lg hover:bg-black/25 hover:border-bg-black/25  hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePromptSubmit}
                      disabled={!newPrompt.trim()}
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {/* <div className="p-4 bg-gray-100 border border-white/10 rounded-lg">
                  <p className="text-sm text-slate-600 leading-relaxed">{currentPrompt}</p>
                </div> */}
                {!isGenerating && (
                  <button
                    onClick={handleEditPrompt}
                    className="w-full p-3 border border-dashed border-gray-400 rounded-lg hover:bg-black/25 hover:border-bg-black/25   transition-colors flex items-center justify-center space-x-2 text-slate-500 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Prompt</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
              AI Processing Status
            </h3>
            <div className="space-y-3">
              {isGenerating && processingSteps.length === 0 && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-sm text-cyan-400">Initializing AI processing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="space-y-3">
              {processingSteps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${
                    step.status === 'error' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : step.status === 'completed'
                      ? 'bg-green-500/10 border-green-500/30'
                      : step.status === 'processing'
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getStepIcon(step.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-slate-500">{step.title}</h4>
                        {step.timestamp && (
                          <span className="text-xs text-slate-500">
                            {step.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.message}</p>
                      {step.error && (
                        <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-900/30 rounded text-xs text-slate-50">
                          <strong>Error:</strong> {step.error}
                          <button className="ml-2 text-yellow-900 hover:text-yellow-300 underline">
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
              Project Details
            </h3>
            <div className="space-y-3 text-sm">
              {/* <div className="flex justify-between">
                <span className="text-slate-500">Framework:</span>
                <span className="text-slate-500 capitalize">{generatedCode.framework}</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={isGenerating ? 'text-yellow-400' : 'text-green-400'}>
                  {isGenerating ? 'Generating...' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Files:</span>
                <span className="text-slate-500">{fileStructure.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Size:</span>
                <span className="text-slate-500">~{Math.round((generatedCode.html.length + generatedCode.css.length + generatedCode.js.length) / 1024)}KB</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Panel - Code/Preview with File Structure */}
        <main className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-white/10 bg-slate-50 p-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'code'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'text-slate-500 hover:text-black hover:bg-white/5'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'text-slate-500 hover:text-black hover:bg-white/5'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Preview
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {activeTab === 'code' ? (
              <>
                {/* File Explorer */}
                <div className="w-64 border-r border-white/10 bg-slate-800/30 p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
                    File Explorer
                  </h4>
                  <div className="space-y-1">
                    {renderFileTree(fileStructure)}
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 p-6">
                  {isGenerating ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-300">Generating your code...</p>
                        <p className="text-sm text-slate-400 mt-2">
                          {processingSteps.find(s => s.status === 'processing')?.message || 'Processing...'}
                        </p>
                      
                      </div>
                    </div>
                  ) : (
                    <div className="h-full">
                      {selectedFile ? (
                        <div className="bg-slate-800 rounded-lg overflow-hidden h-full">
                          <div className="bg-slate-700 px-4 py-2 border-b border-slate-600 flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{selectedFile}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400">
                                {getFileContent(selectedFile).split('\n').length} lines
                              </span>
                            </div>
                          </div>
                          <pre className="p-4 text-xs text-slate-300 overflow-auto h-full">
                            <code>{getFileContent(selectedFile)}</code>
                          </pre>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                          <div className="text-center">
                            <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Select a file to view its contents</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 p-6">
                {isGenerating ? (
                  <div className="h-full flex items-center justify-center bg-white rounded-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-600">Preparing preview...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-white rounded-lg shadow-2xl overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-10 flex space-x-2">
                      <button
                        onClick={openPreviewInNewTab}
                        className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    <iframe
                      srcDoc={createPreviewHTML(generatedCode)}
                      className="w-full h-full border-0"
                      title="Preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
