#!/bin/bash

# Generate new React component
# Usage: ./react-component.sh <ComponentName> [--hooks] [--tests]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: ./react-component.sh <ComponentName> [--hooks] [--tests]"
    exit 1
fi

COMPONENT_NAME=$1
USE_HOOKS=false
CREATE_TESTS=false

# Parse flags
for arg in "${@:2}"; do
    case $arg in
        --hooks)
            USE_HOOKS=true
            ;;
        --tests)
            CREATE_TESTS=true
            ;;
    esac
done

# Convert component name to various formats
COMPONENT_LOWER=$(echo "$COMPONENT_NAME" | sed 's/[A-Z]/_&/g' | sed 's/^_//' | tr '[:upper:]' '[:lower:]')
COMPONENT_KEBAB=$(echo "$COMPONENT_NAME" | sed 's/[A-Z]/-&/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

echo -e "${GREEN}🚀 Generating React component: ${COMPONENT_NAME}${NC}"

# Change to frontend directory
cd "$(dirname "$0")/../../frontend"

# Determine component directory
echo "Where should this component be created?"
echo "1. components/common"
echo "2. components/dashboard"
echo "3. components/layout"
echo "4. components/patients"
echo "5. components/schedule"
echo "6. pages"
echo "7. Custom path"
read -p "Select (1-7): " -n 1 -r
echo

case $REPLY in
    1) COMPONENT_DIR="src/components/common" ;;
    2) COMPONENT_DIR="src/components/dashboard" ;;
    3) COMPONENT_DIR="src/components/layout" ;;
    4) COMPONENT_DIR="src/components/patients" ;;
    5) COMPONENT_DIR="src/components/schedule" ;;
    6) COMPONENT_DIR="src/pages" ;;
    7) 
        read -p "Enter custom path (relative to src/): " CUSTOM_PATH
        COMPONENT_DIR="src/$CUSTOM_PATH"
        ;;
    *) 
        echo "Invalid selection"
        exit 1
        ;;
esac

# Create component directory
mkdir -p "$COMPONENT_DIR"
COMPONENT_PATH="$COMPONENT_DIR/${COMPONENT_NAME}.jsx"

# Generate component content
if [ "$USE_HOOKS" = true ]; then
    # Component with hooks
    cat > "$COMPONENT_PATH" << EOF
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ${COMPONENT_NAME} Component
 * 
 * TODO: Add component description
 */
const ${COMPONENT_NAME} = ({ 
  // Props
  className = '',
  onAction,
  ...props 
}) => {
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Effects
  useEffect(() => {
    // Component mount logic
    loadData();
    
    return () => {
      // Cleanup
    };
  }, []);

  // Handlers
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement data loading
      const response = await fetch('/api/v1/resource');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  // Render
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={\`${COMPONENT_KEBAB}-container \${className}\`} {...props}>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          ${COMPONENT_NAME}
        </h2>
        
        {/* TODO: Implement component content */}
        <div className="space-y-4">
          <p className="text-gray-600">
            ${COMPONENT_NAME} component content goes here.
          </p>
          
          <button
            onClick={handleAction}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Action Button
          </button>
        </div>
      </div>
    </div>
  );
};

${COMPONENT_NAME}.propTypes = {
  className: PropTypes.string,
  onAction: PropTypes.func,
};

export default ${COMPONENT_NAME};
EOF
else
    # Simple component
    cat > "$COMPONENT_PATH" << EOF
import React from 'react';
import PropTypes from 'prop-types';

/**
 * ${COMPONENT_NAME} Component
 * 
 * TODO: Add component description
 */
const ${COMPONENT_NAME} = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div className={\`${COMPONENT_KEBAB}-container \${className}\`} {...props}>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          ${COMPONENT_NAME}
        </h2>
        
        {/* TODO: Implement component content */}
        <div className="space-y-4">
          {children || (
            <p className="text-gray-600">
              ${COMPONENT_NAME} component content goes here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

${COMPONENT_NAME}.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default ${COMPONENT_NAME};
EOF
fi

echo -e "${GREEN}✓ Created component: ${COMPONENT_PATH}${NC}"

# Create test file if requested
if [ "$CREATE_TESTS" = true ]; then
    TEST_DIR="src/__tests__/$(dirname ${COMPONENT_PATH#src/})"
    mkdir -p "$TEST_DIR"
    TEST_PATH="$TEST_DIR/${COMPONENT_NAME}.test.jsx"
    
    cat > "$TEST_PATH" << EOF
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${COMPONENT_NAME} from '${COMPONENT_PATH#src/}';

describe('${COMPONENT_NAME}', () => {
  it('renders without crashing', () => {
    render(<${COMPONENT_NAME} />);
    expect(screen.getByText('${COMPONENT_NAME}')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<${COMPONENT_NAME} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders children when provided', () => {
    render(
      <${COMPONENT_NAME}>
        <span>Test Child</span>
      </${COMPONENT_NAME}>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  ${USE_HOOKS ? `it('handles action click', () => {
    const mockAction = jest.fn();
    render(<${COMPONENT_NAME} onAction={mockAction} />);
    
    const button = screen.getByText('Action Button');
    fireEvent.click(button);
    
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<${COMPONENT_NAME} />);
    // Component should show loading initially
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    );
    
    render(<${COMPONENT_NAME} />);
    
    // Wait for error to appear
    const errorMessage = await screen.findByText(/Error:/);
    expect(errorMessage).toBeInTheDocument();
  });` : ''}
});
EOF
    
    echo -e "${GREEN}✓ Created test file: ${TEST_PATH}${NC}"
fi

# Create Storybook story (optional)
read -p "Create Storybook story? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    STORY_PATH="$COMPONENT_DIR/${COMPONENT_NAME}.stories.jsx"
    
    cat > "$STORY_PATH" << EOF
import React from 'react';
import ${COMPONENT_NAME} from './${COMPONENT_NAME}';

export default {
  title: 'Components/${COMPONENT_NAME}',
  component: ${COMPONENT_NAME},
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: { control: 'text' },
    ${USE_HOOKS ? "onAction: { action: 'clicked' }," : ""}
  },
};

const Template = (args) => <${COMPONENT_NAME} {...args} />;

export const Default = Template.bind({});
Default.args = {
  // Default props
};

export const WithCustomContent = Template.bind({});
WithCustomContent.args = {
  children: <div>Custom content inside the component</div>,
};

${USE_HOOKS ? `export const Loading = Template.bind({});
Loading.args = {
  // Props to trigger loading state
};

export const Error = Template.bind({});
Error.args = {
  // Props to trigger error state
};` : ''}
EOF
    
    echo -e "${GREEN}✓ Created story: ${STORY_PATH}${NC}"
fi

# Update index file if it exists
INDEX_FILE="$COMPONENT_DIR/index.js"
if [ -f "$INDEX_FILE" ]; then
    echo "export { default as ${COMPONENT_NAME} } from './${COMPONENT_NAME}';" >> "$INDEX_FILE"
    echo -e "${GREEN}✓ Updated index file${NC}"
fi

echo
echo -e "${CYAN}Component generated successfully!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Import and use the component:"
echo "   import ${COMPONENT_NAME} from '${COMPONENT_PATH#src/}';"
echo "2. Update the component implementation"
echo "3. Add specific props and functionality"
if [ "$CREATE_TESTS" = true ]; then
    echo "4. Run tests: npm test ${COMPONENT_NAME}"
fi
echo "5. Document component usage in README or Storybook"