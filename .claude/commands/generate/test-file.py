#!/usr/bin/env python3

"""
Generate test file for existing code
Usage: python test-file.py <file_path> [--integration]
"""

import os
import sys
import re
import click
from pathlib import Path

def extract_functions(file_content):
    """Extract function names from Python file"""
    # Find function definitions
    function_pattern = r'(?:async\s+)?def\s+(\w+)\s*\([^)]*\):'
    functions = re.findall(function_pattern, file_content)
    
    # Find class methods
    class_pattern = r'class\s+(\w+).*?:\n((?:\s{4,}.*\n)*)'
    classes = re.findall(class_pattern, file_content, re.MULTILINE)
    
    class_methods = {}
    for class_name, class_body in classes:
        method_pattern = r'(?:async\s+)?def\s+(\w+)\s*\(self[^)]*\):'
        methods = re.findall(method_pattern, class_body)
        class_methods[class_name] = methods
    
    return functions, class_methods

def extract_react_components(file_content):
    """Extract React component names"""
    # Function components
    func_pattern = r'(?:export\s+)?(?:const|function)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>'
    func_components = re.findall(func_pattern, file_content)
    
    # Class components
    class_pattern = r'class\s+(\w+)\s+extends\s+(?:React\.)?Component'
    class_components = re.findall(class_pattern, file_content)
    
    return func_components + class_components

def generate_python_test(file_path, functions, class_methods, is_integration):
    """Generate Python test file content"""
    module_name = file_path.stem
    import_path = str(file_path).replace('/', '.').replace('.py', '')
    
    if 'backend/src/' in import_path:
        import_path = import_path.split('backend/')[-1]
    
    test_content = f'''"""
Tests for {module_name}
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
{"from httpx import AsyncClient" if is_integration else ""}

from {import_path} import {', '.join(functions + list(class_methods.keys()))}

'''
    
    # Add fixtures
    if is_integration:
        test_content += '''@pytest.fixture
async def client():
    """Test client fixture"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_headers():
    """Authentication headers fixture"""
    return {"Authorization": "Bearer test-token"}

'''
    
    # Generate tests for functions
    for func in functions:
        if func.startswith('_'):
            continue
            
        is_async = 'async' in file_path.read_text() and f'async def {func}' in file_path.read_text()
        
        test_content += f'''{"@pytest.mark.asyncio" if is_async else ""}
{"async " if is_async else ""}def test_{func}():
    """Test {func} function"""
    # Arrange
    # TODO: Set up test data
    
    # Act
    result = {"await " if is_async else ""}{func}()
    
    # Assert
    assert result is not None
    # TODO: Add specific assertions

'''
    
    # Generate tests for classes
    for class_name, methods in class_methods.items():
        test_content += f'''class Test{class_name}:
    """Tests for {class_name} class"""
    
    @pytest.fixture
    def {class_name.lower()}_instance(self):
        """Create {class_name} instance"""
        return {class_name}()
    
'''
        for method in methods:
            if method.startswith('_') and method != '__init__':
                continue
                
            test_content += f'''    def test_{method}(self, {class_name.lower()}_instance):
        """Test {method} method"""
        # Arrange
        # TODO: Set up test data
        
        # Act
        result = {class_name.lower()}_instance.{method}()
        
        # Assert
        assert result is not None
        # TODO: Add specific assertions
    
'''
    
    return test_content

def generate_javascript_test(file_path, components):
    """Generate JavaScript/React test file content"""
    component_name = file_path.stem
    import_path = str(file_path.relative_to(Path.cwd())).replace('.jsx', '').replace('.js', '')
    
    test_content = f'''import React from 'react';
import {{ render, screen, fireEvent, waitFor }} from '@testing-library/react';
import '@testing-library/jest-dom';
import {', '.join(components) if components else component_name} from '{import_path}';

'''
    
    for component in (components or [component_name]):
        test_content += f'''describe('{component}', () => {{
  it('renders without crashing', () => {{
    render(<{component} />);
    expect(screen.getByTestId('{component.lower()}')).toBeInTheDocument();
  }});

  it('handles props correctly', () => {{
    const props = {{
      // TODO: Add test props
    }};
    
    render(<{component} {{...props}} />);
    // TODO: Add assertions
  }});

  it('handles user interactions', () => {{
    const mockHandler = jest.fn();
    render(<{component} onClick={{mockHandler}} />);
    
    const element = screen.getByRole('button');
    fireEvent.click(element);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  }});

  it('displays loading state', () => {{
    render(<{component} loading={{true}} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  }});

  it('displays error state', () => {{
    const errorMessage = 'Test error';
    render(<{component} error={{errorMessage}} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  }});
}});

'''
    
    return test_content

@click.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.option('--integration', is_flag=True, help='Generate integration tests')
def generate_test(file_path, integration):
    """Generate test file for existing code"""
    file_path = Path(file_path)
    
    if not file_path.is_file():
        click.echo(click.style(f"Error: {file_path} is not a file", fg="red"))
        return
    
    # Determine test directory
    if 'backend' in str(file_path):
        test_dir = Path('backend/tests')
        is_python = True
    elif 'frontend' in str(file_path):
        test_dir = Path('frontend/src/__tests__') / file_path.parent.relative_to('frontend/src')
        is_python = False
    else:
        click.echo(click.style("Error: File must be in backend or frontend directory", fg="red"))
        return
    
    # Create test directory
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate test file name
    if is_python:
        test_file = test_dir / f"test_{file_path.stem}.py"
    else:
        test_file = test_dir / f"{file_path.stem}.test.{file_path.suffix[1:]}"
    
    # Check if test already exists
    if test_file.exists():
        if not click.confirm(f"Test file {test_file} already exists. Overwrite?"):
            return
    
    # Read source file
    file_content = file_path.read_text()
    
    # Generate test content
    click.echo(click.style(f"🧪 Generating test for {file_path}", fg="green"))
    
    if is_python:
        functions, class_methods = extract_functions(file_content)
        test_content = generate_python_test(file_path, functions, class_methods, integration)
        click.echo(f"  Found {len(functions)} functions and {len(class_methods)} classes")
    else:
        components = extract_react_components(file_content)
        test_content = generate_javascript_test(file_path, components)
        click.echo(f"  Found {len(components)} components")
    
    # Write test file
    test_file.write_text(test_content)
    click.echo(click.style(f"✓ Created test file: {test_file}", fg="green"))
    
    # Instructions
    click.echo("\n" + click.style("Next steps:", fg="yellow"))
    click.echo("1. Review and update the generated test cases")
    click.echo("2. Add specific test data and assertions")
    click.echo("3. Run the tests:")
    
    if is_python:
        click.echo(f"   pytest {test_file}")
    else:
        click.echo(f"   npm test {file_path.stem}")

if __name__ == "__main__":
    generate_test()