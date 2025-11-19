import { useState, useEffect } from 'react';
import { Avatar, avatarOptions } from './Avatar';
import type { AvatarConfig } from './Avatar';
import { useAvatar } from '../../hooks/useAvatar';

export function AvatarCustomizer() {
  const { avatar, isLoading, updateAvatar, isUpdating, updateError } = useAvatar();

  const [config, setConfig] = useState<AvatarConfig>({
    body: 'body-1',
    expression: 'body-1-h1'
  });
  const [selectedBody, setSelectedBody] = useState('body-1');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (avatar) {
      setConfig(avatar);
      setSelectedBody(avatar.body || 'body-1');
    }
  }, [avatar]);

  const updateConfig = (key: keyof AvatarConfig, value: string | undefined) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBodyChange = (body: string) => {
    setSelectedBody(body);
    setConfig(prev => ({
      ...prev,
      body,
      expression: undefined 
    }));
  };

  const handleExpressionChange = (expression: string) => {
    setConfig(prev => ({
      ...prev,
      expression
    }));
  };

  const handleSave = () => {
    updateAvatar(config, {
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading your avatar...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Avatar Customizer</h1>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: saveSuccess ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            opacity: isUpdating ? 0.6 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {isUpdating ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Avatar'}
        </button>
      </div>

      {updateError && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error saving avatar: {updateError.message}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 300px' }}>
          <h2>Preview</h2>
          <div style={{
            border: '2px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <Avatar config={config} size={250} />
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Config (save this in database):</h3>
            <pre style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Body Pose</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {avatarOptions.bodies.map(body => (
                <button
                  key={body}
                  onClick={() => handleBodyChange(body)}
                  style={{
                    padding: '8px 16px',
                    border: selectedBody === body ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: selectedBody === body ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {body}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Expression</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleExpressionChange(selectedBody)}
                style={{
                  padding: '8px 16px',
                  border: config.expression === selectedBody ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: config.expression === selectedBody ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                neutral
              </button>
              {avatarOptions.expressions[selectedBody as keyof typeof avatarOptions.expressions]?.map(expr => (
                <button
                  key={expr}
                  onClick={() => handleExpressionChange(expr)}
                  style={{
                    padding: '8px 16px',
                    border: config.expression === expr ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.expression === expr ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {expr.split('-').pop()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Hair</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateConfig('hair', undefined)}
                style={{
                  padding: '8px 16px',
                  border: !config.hair ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: !config.hair ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                None
              </button>
              {avatarOptions.hair.map(hair => (
                <button
                  key={hair}
                  onClick={() => updateConfig('hair', hair)}
                  style={{
                    padding: '8px 16px',
                    border: config.hair === hair ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.hair === hair ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {hair}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Headwear</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateConfig('headwear', undefined)}
                style={{
                  padding: '8px 16px',
                  border: !config.headwear ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: !config.headwear ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                None
              </button>
              {avatarOptions.headwear.map(headwear => (
                <button
                  key={headwear}
                  onClick={() => updateConfig('headwear', headwear)}
                  style={{
                    padding: '8px 16px',
                    border: config.headwear === headwear ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.headwear === headwear ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {headwear}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Eyewear</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateConfig('eyewear', undefined)}
                style={{
                  padding: '8px 16px',
                  border: !config.eyewear ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: !config.eyewear ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                None
              </button>
              {avatarOptions.eyewear.map(eyewear => (
                <button
                  key={eyewear}
                  onClick={() => updateConfig('eyewear', eyewear)}
                  style={{
                    padding: '8px 16px',
                    border: config.eyewear === eyewear ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.eyewear === eyewear ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {eyewear}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Facial Hair</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateConfig('facial', undefined)}
                style={{
                  padding: '8px 16px',
                  border: !config.facial ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: !config.facial ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                None
              </button>
              {avatarOptions.facial.map(facial => (
                <button
                  key={facial}
                  onClick={() => updateConfig('facial', facial)}
                  style={{
                    padding: '8px 16px',
                    border: config.facial === facial ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.facial === facial ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {facial}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Clothing</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateConfig('clothing', undefined)}
                style={{
                  padding: '8px 16px',
                  border: !config.clothing ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: !config.clothing ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                None
              </button>
              {avatarOptions.clothing.map(clothing => (
                <button
                  key={clothing}
                  onClick={() => updateConfig('clothing', clothing)}
                  style={{
                    padding: '8px 16px',
                    border: config.clothing === clothing ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.clothing === clothing ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {clothing}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Shoes</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => updateConfig('shoes', undefined)}
                style={{
                  padding: '8px 16px',
                  border: !config.shoes ? '2px solid #007bff' : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: !config.shoes ? '#e7f3ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                None
              </button>
              {avatarOptions.shoes.map(shoe => (
                <button
                  key={shoe}
                  onClick={() => updateConfig('shoes', shoe)}
                  style={{
                    padding: '8px 16px',
                    border: config.shoes === shoe ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: config.shoes === shoe ? '#e7f3ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {shoe}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarCustomizer;