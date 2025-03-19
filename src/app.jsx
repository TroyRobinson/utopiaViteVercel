import * as React from 'react';
import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import * as Avatar from '@radix-ui/react-avatar';

// FlexCol component (same as the example)
const FlexCol = ({ children, style, ...props }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// FlexRow component for horizontal layouts
const FlexRow = ({ children, style, ...props }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Tag component for technologies
const Tag = ({ children }) => {
  return (
    <span
      style={{
        backgroundColor: '#f0f0f0',
        color: '#333',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        marginRight: '8px',
        marginBottom: '8px',
        display: 'inline-block'
      }}
    >
      {children}
    </span>
  );
};

export const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [db, setDb] = useState(null);
  
  // Form state
  const [newCaseStudy, setNewCaseStudy] = useState({
    name: '',
    description: '',
    technologies: '',
    date: ''
  });

  // Initialize InstantDB
  useEffect(() => {
    const initializeDb = async () => {
      try {
        console.log("Loading InstantDB from esm.sh...");
        
        // Import the modules using esm.sh
        const instantdbModule = await import("https://esm.sh/@instantdb/core@0.17.31");
        
        if (!instantdbModule) {
          throw new Error("Failed to load InstantDB module");
        }
        
        console.log("InstantDB module loaded:", instantdbModule);
        
        // Extract the required functions
        const { init, i, id } = instantdbModule;
        
        console.log("InstantDB loaded successfully, initializing app...");

        // ID for app
        const APP_ID = "4a592307-cbd2-44e0-8818-d863e9e95399";

        // Declare schema
        const schema = i.schema({
          entities: {
            caseStudies: i.entity({
              name: i.string(),
              description: i.string(),
              technologies: i.string(), // Comma-separated tags
              date: i.string(),
              createdAt: i.date(),
            }),
          },
        });

        // Initialize the database
        console.log("Initializing InstantDB with appId:", APP_ID);
        const database = init({ 
          appId: APP_ID, 
          schema,
        });

        setDb({ database, id });
        
        console.log("Database initialized, subscribing to queries...");

        // Subscribe to data
        database.subscribeQuery({ caseStudies: {} }, (resp) => {
          if (resp.error) {
            setError(resp.error.message);
            setLoading(false);
            return;
          }
          
          if (resp.data) {
            console.log("Data received:", resp.data);
            setCaseStudies(resp.data.caseStudies || []);
            setLoading(false);
          }
        });
        
      } catch (err) {
        setError("Error initializing the application: " + err.message);
        setLoading(false);
        console.error("Full error:", err);
      }
    };

    initializeDb();
  }, []);

  // Case Studies operations
  const addCaseStudy = () => {
    if (!db) return;
    
    console.log("Adding case study:", newCaseStudy);
    db.database.transact(
      db.database.tx.caseStudies[db.id()].update({
        name: newCaseStudy.name,
        description: newCaseStudy.description,
        technologies: newCaseStudy.technologies,
        date: newCaseStudy.date,
        createdAt: Date.now(),
      })
    );

    // Reset form
    setNewCaseStudy({
      name: '',
      description: '',
      technologies: '',
      date: ''
    });
    
    // Close dialog
    setDialogOpen(false);
  };

  const deleteCaseStudy = (caseStudy) => {
    if (!db) return;
    
    console.log("Deleting case study:", caseStudy.id);
    db.database.transact(db.database.tx.caseStudies[caseStudy.id].delete());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCaseStudy(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCaseStudy.name && newCaseStudy.technologies) {
      addCaseStudy();
    }
  };

  // Sort case studies by date (newest first)
  const sortedCaseStudies = [...caseStudies].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <FlexCol
      style={{
        width: '100%',
        height: '100%',
        padding: '40px',
        fontFamily: 'sans-serif',
        backgroundColor: '#f9f9f9',
        color: '#333'
      }}
    >
      <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0 0 20px 0' }}>
        <FlexCol>
          <h1 style={{ fontSize: '2.5rem', padding: '0 0 10px 0' }}>My Portfolio</h1>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Web Developer & Designer</p>
        </FlexCol>
        
        <Avatar.Root style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          overflow: 'hidden',
          userSelect: 'none',
          width: 100,
          height: 100,
          borderRadius: '100%',
          backgroundColor: 'black'
        }}>
          <Avatar.Fallback style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgb(43, 108, 176)',
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            MP
          </Avatar.Fallback>
        </Avatar.Root>
      </FlexRow>
      
      <Separator.Root style={{ height: '1px', backgroundColor: '#e0e0e0', padding: '0', margin: '0 0 20px 0' }} />
      
      <Tabs.Root defaultValue="about">
        <Tabs.List style={{ display: 'flex', padding: '0 0 20px 0' }}>
          <Tabs.Trigger value="about" style={{ 
            backgroundColor: 'transparent',
            padding: '10px 20px',
            border: 'none',
            borderBottom: '2px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            About Me
          </Tabs.Trigger>
          <Tabs.Trigger value="portfolio" style={{ 
            backgroundColor: 'transparent',
            padding: '10px 20px',
            border: 'none',
            borderBottom: '2px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            Case Studies
          </Tabs.Trigger>
          <Tabs.Trigger value="contact" style={{ 
            backgroundColor: 'transparent',
            padding: '10px 20px',
            border: 'none',
            borderBottom: '2px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            Contact
          </Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="about">
          <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.8rem', padding: '0 0 20px 0' }}>About Me</h2>
            <p style={{ lineHeight: '1.6', fontSize: '1.1rem', padding: '0 0 20px 0' }}>
              I'm a passionate web developer and designer with expertise in creating modern, responsive, and user-friendly websites and applications. With over 5 years of experience, I specialize in React, Node.js, and modern frontend development practices.
            </p>
            
            <h3 style={{ fontSize: '1.4rem', padding: '0 0 15px 0' }}>Skills</h3>
            <FlexRow style={{ flexWrap: 'wrap', padding: '0 0 20px 0' }}>
              <Tag>React</Tag>
              <Tag>Node.js</Tag>
              <Tag>TypeScript</Tag>
              <Tag>GraphQL</Tag>
              <Tag>Next.js</Tag>
              <Tag>CSS/SCSS</Tag>
              <Tag>Figma</Tag>
              <Tag>UI/UX Design</Tag>
            </FlexRow>
          </FlexCol>
        </Tabs.Content>
        
        <Tabs.Content value="portfolio">
          <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0 0 20px 0' }}>
              <h2 style={{ fontSize: '1.8rem', padding: '0' }}>Case Studies</h2>
              
              <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                <Dialog.Trigger asChild>
                  <button
                    style={{
                      backgroundColor: '#2b6cb0',
                      color: 'white',
                      padding: '10px 15px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    Add New Case Study
                  </button>
                </Dialog.Trigger>
                
                <Dialog.Portal>
                  <Dialog.Overlay style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    position: 'fixed',
                    inset: 0
                  }} />
                  <Dialog.Content style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '500px',
                    padding: '20px',
                    maxHeight: '85vh',
                    overflowY: 'auto'
                  }}>
                    <Dialog.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0 0 20px 0' }}>
                      New Case Study
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit}>
                      <FlexCol style={{ gap: '15px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontWeight: 'bold' }}>Project Name</span>
                          <input
                            type="text"
                            name="name"
                            value={newCaseStudy.name}
                            onChange={handleInputChange}
                            required
                            style={{
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px'
                            }}
                          />
                        </label>
                        
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontWeight: 'bold' }}>Description</span>
                          <textarea
                            name="description"
                            value={newCaseStudy.description}
                            onChange={handleInputChange}
                            rows={3}
                            style={{
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              resize: 'vertical'
                            }}
                          />
                        </label>
                        
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontWeight: 'bold' }}>Technologies (comma separated)</span>
                          <input
                            type="text"
                            name="technologies"
                            value={newCaseStudy.technologies}
                            onChange={handleInputChange}
                            required
                            placeholder="React, Node.js, GraphQL"
                            style={{
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px'
                            }}
                          />
                        </label>
                        
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontWeight: 'bold' }}>Date</span>
                          <input
                            type="date"
                            name="date"
                            value={newCaseStudy.date}
                            onChange={handleInputChange}
                            style={{
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px'
                            }}
                          />
                        </label>
                        
                        <FlexRow style={{ justifyContent: 'flex-end', gap: '10px', padding: '10px 0 0 0' }}>
                          <Dialog.Close asChild>
                            <button type="button" style={{
                              padding: '10px 15px',
                              backgroundColor: '#f3f4f6',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}>
                              Cancel
                            </button>
                          </Dialog.Close>
                          
                          <button type="submit" style={{
                            padding: '10px 15px',
                            backgroundColor: '#2b6cb0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}>
                            Add Case Study
                          </button>
                        </FlexRow>
                      </FlexCol>
                    </form>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </FlexRow>
            
            {loading && (
              <div style={{ padding: '20px 0' }}>Loading case studies...</div>
            )}
            
            {error && (
              <div style={{ 
                color: 'red', 
                backgroundColor: '#ffeeee', 
                padding: '10px', 
                border: '1px solid #ffcccc',
                borderRadius: '4px'
              }}>
                Error: {error}
              </div>
            )}
            
            {!loading && !error && sortedCaseStudies.length === 0 && (
              <div style={{ padding: '20px 0', color: '#666' }}>
                No case studies yet. Add your first one!
              </div>
            )}
            
            <FlexCol style={{ gap: '15px' }}>
              {sortedCaseStudies.map(study => (
                <div key={study.id} style={{ 
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fafafa'
                }}>
                  <FlexRow style={{ justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 0 10px 0' }}>
                    <h3 style={{ fontSize: '1.3rem', padding: '0' }}>{study.name}</h3>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>{study.date}</span>
                  </FlexRow>
                  
                  {study.description && (
                    <p style={{ padding: '0 0 15px 0', lineHeight: '1.5' }}>{study.description}</p>
                  )}
                  
                  <FlexCol style={{ padding: '0 0 15px 0' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#666', padding: '0 0 8px 0' }}>Technologies</h4>
                    <FlexRow style={{ flexWrap: 'wrap', gap: '5px' }}>
                      {study.technologies.split(',').map((tech, index) => (
                        <Tag key={index}>{tech.trim()}</Tag>
                      ))}
                    </FlexRow>
                  </FlexCol>
                  
                  <button 
                    onClick={() => deleteCaseStudy(study)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </FlexCol>
          </FlexCol>
        </Tabs.Content>
        
        <Tabs.Content value="contact">
          <FlexCol style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.8rem', padding: '0 0 20px 0' }}>Contact Me</h2>
            
            <FlexCol style={{ gap: '15px', padding: '0 0 20px 0' }}>
              <FlexRow style={{ alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '80px' }}>Email:</span>
                <a href="mailto:contact@example.com" style={{ color: '#2b6cb0' }}>contact@example.com</a>
              </FlexRow>
              
              <FlexRow style={{ alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '80px' }}>LinkedIn:</span>
                <a href="https://linkedin.com/in/example" target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0' }}>linkedin.com/in/example</a>
              </FlexRow>
              
              <FlexRow style={{ alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '80px' }}>GitHub:</span>
                <a href="https://github.com/example" target="_blank" rel="noopener noreferrer" style={{ color: '#2b6cb0' }}>github.com/example</a>
              </FlexRow>
            </FlexCol>
            
            <Accordion.Root type="single" collapsible>
              <Accordion.Item value="form">
                <Accordion.Trigger style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  padding: '15px',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 'bold'
                }}>
                  <span>Send me a message</span>
                  <span style={{ fontSize: '1.2rem' }}>+</span>
                </Accordion.Trigger>
                
                <Accordion.Content style={{
                  overflow: 'hidden',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '0 0 4px 4px',
                  padding: '15px'
                }}>
                  <form>
                    <FlexCol style={{ gap: '15px' }}>
                      <FlexRow style={{ gap: '15px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                          <span>Name</span>
                          <input type="text" style={{
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }} />
                        </label>
                        
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '50%' }}>
                          <span>Email</span>
                          <input type="email" style={{
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }} />
                        </label>
                      </FlexRow>
                      
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span>Subject</span>
                        <input type="text" style={{
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }} />
                      </label>
                      
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span>Message</span>
                        <textarea rows={4} style={{
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          resize: 'vertical'
                        }} />
                      </label>
                      
                      <button type="button" style={{
                        alignSelf: 'flex-start',
                        backgroundColor: '#2b6cb0',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        Send Message
                      </button>
                    </FlexCol>
                  </form>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </FlexCol>
        </Tabs.Content>
      </Tabs.Root>
    </FlexCol>
  );
};

export default App;