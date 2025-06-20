#!/usr/bin/env python3

"""
Generate complete CRUD module (API + Frontend)
Usage: python crud-module.py <module_name> [--no-frontend] [--no-backend]
"""

import os
import sys
import click
from pathlib import Path
from datetime import datetime

# Import endpoint generator functionality
sys.path.append(str(Path(__file__).parent))
from api_endpoint import ENDPOINT_TEMPLATE, MODEL_TEMPLATE, TEST_TEMPLATE, pluralize

FRONTEND_LIST_TEMPLATE = '''import React, {{ useState, useEffect }} from 'react';
import {{ useNavigate }} from 'react-router-dom';
import {{ PlusIcon, SearchIcon }} from '@heroicons/react/outline';
import {module_class}Modal from './{module_class}Modal';
import {module_class}Card from './{module_class}Card';
import {{ get{module_plural_class}, delete{module_class} }} from '../../services/{module_lower}Service';

const {module_class}List = () => {{
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [{module_lower_plural}, set{module_plural_class}] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected{module_class}, setSelected{module_class}] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {{
    load{module_plural_class}();
  }}, []);

  const load{module_plural_class} = async () => {{
    try {{
      setLoading(true);
      const data = await get{module_plural_class}();
      set{module_plural_class}(data);
      setError(null);
    }} catch (err) {{
      setError('Failed to load {module_lower_plural}');
      console.error(err);
    }} finally {{
      setLoading(false);
    }}
  }};

  const handleDelete = async (id) => {{
    if (window.confirm('Are you sure you want to delete this {module_lower}?')) {{
      try {{
        await delete{module_class}(id);
        await load{module_plural_class}();
      }} catch (err) {{
        setError('Failed to delete {module_lower}');
      }}
    }}
  }};

  const handleEdit = ({module_lower}) => {{
    setSelected{module_class}({module_lower});
    setShowModal(true);
  }};

  const handleModalClose = () => {{
    setShowModal(false);
    setSelected{module_class}(null);
    load{module_plural_class}();
  }};

  const filtered{module_plural_class} = {module_lower_plural}.filter({module_lower} =>
    {module_lower}.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {{
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }}

  return (
    <div className="space-y-6">
      {{/* Header */}}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{module_plural_class}</h1>
        <button
          onClick={{() => setShowModal(true)}}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add {module_class}
        </button>
      </div>

      {{/* Search */}}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search {module_lower_plural}..."
          value={{searchTerm}}
          onChange={{(e) => setSearchTerm(e.target.value)}}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {{/* Error Message */}}
      {{error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{{error}}</p>
        </div>
      )}}

      {{/* List */}}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {{filtered{module_plural_class}.map({module_lower} => (
          <{module_class}Card
            key={{{module_lower}.id}}
            {module_lower}={{{module_lower}}}
            onEdit={{() => handleEdit({module_lower})}}
            onDelete={{() => handleDelete({module_lower}.id)}}
          />
        ))}}
      </div>

      {{/* Empty State */}}
      {{filtered{module_plural_class}.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No {module_lower_plural} found</p>
        </div>
      )}}

      {{/* Modal */}}
      {{showModal && (
        <{module_class}Modal
          {module_lower}={{selected{module_class}}}
          onClose={{handleModalClose}}
        />
      )}}
    </div>
  );
}};

export default {module_class}List;
'''

FRONTEND_CARD_TEMPLATE = '''import React from 'react';
import PropTypes from 'prop-types';
import {{ PencilIcon, TrashIcon }} from '@heroicons/react/outline';

const {module_class}Card = ({{ {module_lower}, onEdit, onDelete }}) => {{
  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">{{{module_lower}.name}}</h3>
        <div className="flex space-x-2">
          <button
            onClick={{onEdit}}
            className="text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={{onDelete}}
            className="text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {{/* Add more fields here */}}
      <p className="text-gray-600">{{{module_lower}.description || 'No description'}}</p>
      
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <span>Created: {{new Date({module_lower}.created_at).toLocaleDateString()}}</span>
      </div>
    </div>
  );
}};

{module_class}Card.propTypes = {{
  {module_lower}: PropTypes.shape({{
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    created_at: PropTypes.string,
  }}).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}};

export default {module_class}Card;
'''

FRONTEND_MODAL_TEMPLATE = '''import React, {{ useState, useEffect }} from 'react';
import PropTypes from 'prop-types';
import {{ XIcon }} from '@heroicons/react/outline';
import {{ create{module_class}, update{module_class} }} from '../../services/{module_lower}Service';

const {module_class}Modal = ({{ {module_lower}, onClose }}) => {{
  const [formData, setFormData] = useState({{
    name: '',
    description: '',
    // Add more fields
  }});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({{}});

  useEffect(() => {{
    if ({module_lower}) {{
      setFormData({{
        name: {module_lower}.name || '',
        description: {module_lower}.description || '',
        // Map more fields
      }});
    }}
  }}, [{module_lower}]);

  const handleChange = (e) => {{
    const {{ name, value }} = e.target;
    setFormData(prev => ({{
      ...prev,
      [name]: value
    }}));
    // Clear error for this field
    if (errors[name]) {{
      setErrors(prev => ({{ ...prev, [name]: null }}));
    }}
  }};

  const validate = () => {{
    const newErrors = {{}};
    
    if (!formData.name.trim()) {{
      newErrors.name = 'Name is required';
    }}
    
    // Add more validation
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }};

  const handleSubmit = async (e) => {{
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {{
      if ({module_lower}) {{
        await update{module_class}({module_lower}.id, formData);
      }} else {{
        await create{module_class}(formData);
      }}
      onClose();
    }} catch (error) {{
      setErrors({{ submit: error.message || 'Failed to save {module_lower}' }});
    }} finally {{
      setLoading(false);
    }}
  }};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {{/* Overlay */}}
        <div className="fixed inset-0 bg-black opacity-30" onClick={{onClose}}></div>
        
        {{/* Modal */}}
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {{{module_lower} ? 'Edit' : 'Add'}} {module_class}
            </h2>
            <button
              onClick={{onClose}}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={{handleSubmit}} className="space-y-4">
            {{/* Name Field */}}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={{formData.name}}
                onChange={{handleChange}}
                className={{`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${{errors.name ? 'border-red-300' : ''}}`}}
              />
              {{errors.name && (
                <p className="mt-1 text-sm text-red-600">{{errors.name}}</p>
              )}}
            </div>
            
            {{/* Description Field */}}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={{formData.description}}
                onChange={{handleChange}}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {{/* Error Message */}}
            {{errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{{errors.submit}}</p>
              </div>
            )}}
            
            {{/* Actions */}}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={{onClose}}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={{loading}}
                className={{`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${{loading ? 'cursor-not-allowed' : ''}}`}}
              >
                {{loading ? 'Saving...' : ({module_lower} ? 'Update' : 'Create')}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}};

{module_class}Modal.propTypes = {{
  {module_lower}: PropTypes.shape({{
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }}),
  onClose: PropTypes.func.isRequired,
}};

export default {module_class}Modal;
'''

FRONTEND_SERVICE_TEMPLATE = '''import api from './api';

const ENDPOINT = '/{module_lower_plural}';

export const get{module_plural_class} = async (params = {{}}) => {{
  const response = await api.get(ENDPOINT, {{ params }});
  return response.data;
}};

export const get{module_class} = async (id) => {{
  const response = await api.get(`${{ENDPOINT}}/${{id}}`);
  return response.data;
}};

export const create{module_class} = async (data) => {{
  const response = await api.post(ENDPOINT, data);
  return response.data;
}};

export const update{module_class} = async (id, data) => {{
  const response = await api.put(`${{ENDPOINT}}/${{id}}`, data);
  return response.data;
}};

export const delete{module_class} = async (id) => {{
  const response = await api.delete(`${{ENDPOINT}}/${{id}}`);
  return response.data;
}};

export const search{module_plural_class} = async (query) => {{
  const response = await api.get(ENDPOINT, {{
    params: {{ search: query }}
  }});
  return response.data;
}};
'''

@click.command()
@click.argument('module_name')
@click.option('--no-frontend', is_flag=True, help='Skip frontend generation')
@click.option('--no-backend', is_flag=True, help='Skip backend generation')
def generate_crud_module(module_name, no_frontend, no_backend):
    """Generate complete CRUD module"""
    
    # Prepare variables
    module_lower = module_name.lower()
    module_class = ''.join(word.capitalize() for word in module_name.split('_'))
    module_title = module_name.replace('_', ' ').title()
    module_plural = pluralize(module_lower)
    module_plural_class = pluralize(module_class)
    module_lower_plural = pluralize(module_lower)
    date = datetime.now().strftime('%Y-%m-%d')
    
    click.echo(click.style(f"🚀 Generating CRUD module for {module_title}", fg="green", bold=True))
    
    # Generate backend
    if not no_backend:
        click.echo("\n" + click.style("Backend Generation", fg="cyan"))
        click.echo("-" * 30)
        
        # Create API endpoint
        backend_path = Path("backend")
        endpoint_path = backend_path / "src" / "api" / "endpoints" / f"{module_plural}.py"
        model_path = backend_path / "src" / "models" / f"{module_lower}.py"
        test_path = backend_path / "tests" / f"test_{module_plural}.py"
        
        # Generate files
        endpoint_content = ENDPOINT_TEMPLATE.format(
            resource_lower=module_lower,
            resource_class=module_class,
            resource_title=module_title,
            resource_plural=module_plural,
            date=date,
            auth_param="current_user = Depends(get_current_user)",
            auth_created_by=f'{module_lower}_dict["created_by"] = str(current_user.id)',
            auth_updated_by=f'update_data["updated_by"] = str(current_user.id)'
        )
        
        model_content = MODEL_TEMPLATE.format(
            resource_lower=module_lower,
            resource_class=module_class,
            resource_title=module_title,
            date=date
        )
        
        test_content = TEST_TEMPLATE.format(
            resource_lower=module_lower,
            resource_class=module_class,
            resource_title=module_title,
            resource_plural=module_plural,
            date=date
        )
        
        # Write files
        endpoint_path.parent.mkdir(parents=True, exist_ok=True)
        endpoint_path.write_text(endpoint_content)
        click.echo(f"  ✓ Created API endpoint: {endpoint_path}")
        
        model_path.parent.mkdir(parents=True, exist_ok=True)
        model_path.write_text(model_content)
        click.echo(f"  ✓ Created model: {model_path}")
        
        test_path.parent.mkdir(parents=True, exist_ok=True)
        test_path.write_text(test_content)
        click.echo(f"  ✓ Created tests: {test_path}")
    
    # Generate frontend
    if not no_frontend:
        click.echo("\n" + click.style("Frontend Generation", fg="cyan"))
        click.echo("-" * 30)
        
        frontend_path = Path("frontend")
        component_dir = frontend_path / "src" / "components" / module_plural
        service_path = frontend_path / "src" / "services" / f"{module_lower}Service.js"
        page_path = frontend_path / "src" / "pages" / f"{module_plural_class}.jsx"
        
        # Create component directory
        component_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate component files
        list_content = FRONTEND_LIST_TEMPLATE.format(
            module_lower=module_lower,
            module_class=module_class,
            module_plural_class=module_plural_class,
            module_lower_plural=module_lower_plural
        )
        
        card_content = FRONTEND_CARD_TEMPLATE.format(
            module_lower=module_lower,
            module_class=module_class
        )
        
        modal_content = FRONTEND_MODAL_TEMPLATE.format(
            module_lower=module_lower,
            module_class=module_class
        )
        
        service_content = FRONTEND_SERVICE_TEMPLATE.format(
            module_lower_plural=module_lower_plural,
            module_plural_class=module_plural_class,
            module_class=module_class
        )
        
        # Write files
        (component_dir / f"{module_class}List.jsx").write_text(list_content)
        click.echo(f"  ✓ Created list component: {component_dir}/{module_class}List.jsx")
        
        (component_dir / f"{module_class}Card.jsx").write_text(card_content)
        click.echo(f"  ✓ Created card component: {component_dir}/{module_class}Card.jsx")
        
        (component_dir / f"{module_class}Modal.jsx").write_text(modal_content)
        click.echo(f"  ✓ Created modal component: {component_dir}/{module_class}Modal.jsx")
        
        service_path.parent.mkdir(parents=True, exist_ok=True)
        service_path.write_text(service_content)
        click.echo(f"  ✓ Created service: {service_path}")
        
        # Create page component
        page_content = f'''import React from 'react';
import {module_class}List from '../components/{module_plural}/{module_class}List';

const {module_plural_class} = () => {{
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <{module_class}List />
    </div>
  );
}};

export default {module_plural_class};
'''
        
        page_path.write_text(page_content)
        click.echo(f"  ✓ Created page: {page_path}")
    
    # Instructions
    click.echo("\n" + click.style("Setup Instructions", fg="yellow", bold=True))
    click.echo("=" * 50)
    
    if not no_backend:
        click.echo("\n" + click.style("Backend Setup:", fg="yellow"))
        click.echo(f"1. Add router to backend/src/main.py:")
        click.echo(f"   from src.api.endpoints.{module_plural} import router as {module_plural}_router")
        click.echo(f"   app.include_router({module_plural}_router, prefix='/api/v1')")
        click.echo(f"2. Update model fields in {model_path}")
        click.echo(f"3. Run migrations: python .claude/commands/db/migrate.py up")
        click.echo(f"4. Run tests: pytest backend/tests/test_{module_plural}.py")
    
    if not no_frontend:
        click.echo("\n" + click.style("Frontend Setup:", fg="yellow"))
        click.echo(f"1. Add route to frontend/src/App.jsx:")
        click.echo(f"   import {module_plural_class} from './pages/{module_plural_class}';")
        click.echo(f"   <Route path='/{module_plural}' element={{<{module_plural_class} />}} />")
        click.echo(f"2. Add navigation link to Sidebar.jsx")
        click.echo(f"3. Update component styling and fields")
        click.echo(f"4. Test the module: npm start")
    
    click.echo("\n" + click.style("✨ CRUD module generated successfully!", fg="green", bold=True))

if __name__ == "__main__":
    generate_crud_module()