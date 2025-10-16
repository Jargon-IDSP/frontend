// import { TopHat } from './TopHat' 
// import { Mustache } from './Mustache'

export default function HappyRocky() {
  return (
    <div style={{ 
      position: 'relative', 
      marginLeft: "9rem", 
      marginTop: "2rem",
      width: "150px",
      height: "150px" 
    }}>
      {/* Hat layer
      <div style={{
        position: 'absolute',
        top: '-35px', // adjust this to position hat correctly
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px', // adjust hat size
        height: '100px',
        zIndex: 10
      }}>
        <TopHat color="#5226b2ff" />
      </div>

      {/* Hat layer */}
      {/* <div style={{
        position: 'absolute',
        top: '3px',
        left: '55%',
        transform: 'translateX(-50%)',
        width: '100px', // adjust hat size
        height: '100px',
        zIndex: 10
      }}>
        <Mustache color="#3d2817" />
      </div> */} 
      
      
      <img 
        className="HappyRocky"
        src="/rocky.svg"
        alt="Rocky the Mascot"
        style={{ width: "150px" }}
      />
    </div>
  )
}