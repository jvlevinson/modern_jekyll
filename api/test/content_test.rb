# frozen_string_literal: true

# =============================================================================
# Content API Tests
# =============================================================================
# Tests for content CRUD endpoints
# Validates create, read, update, delete operations
# =============================================================================

require_relative 'test_helper'
require 'securerandom'

class ContentAPITest < APITest
  def setup
    @test_content = {
      title: 'Test Post',
      content: 'This is test content.',
      type: 'post'
    }
  end

  # ==========================================================================
  # GET /api/content
  # ==========================================================================

  def test_list_content_returns_array
    get '/api/content'

    assert_success
    assert_kind_of Array, json_response[:items]
  end

  def test_list_content_filters_by_type
    # Create test content of different types
    post_data = @test_content.dup
    page_data = @test_content.merge(title: 'Test Page', type: 'page')

    post '/api/content', post_data.to_json, 'CONTENT_TYPE' => 'application/json'
    post_id = json_response[:item][:id]

    post '/api/content', page_data.to_json, 'CONTENT_TYPE' => 'application/json'
    page_id = json_response[:item][:id]

    # Filter by type
    get '/api/content?type=post'

    items = json_response[:items]
    post_items = items.select { |i| i[:type] == 'post' }
    page_items = items.select { |i| i[:type] == 'page' }

    assert post_items.any? { |i| i[:id] == post_id }
    refute page_items.any? { |i| i[:id] == page_id }
  end

  # ==========================================================================
  # POST /api/content
  # ==========================================================================

  def test_create_content_with_valid_data
    post '/api/content', @test_content.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    assert_equal 'Content created', json_response[:message]

    item = json_response[:item]
    assert item[:id], 'Expected ID'
    assert_equal 'Test Post', item[:title]
    assert_equal 'This is test content.', item[:content]
    assert_equal 'post', item[:type]
    assert item[:created_at], 'Expected created_at timestamp'
  end

  def test_create_content_validates_required_fields
    incomplete = { title: 'Only Title' }

    post '/api/content', incomplete.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert json_response[:errors], 'Expected validation errors'
  end

  def test_create_content_validates_type
    invalid = @test_content.merge(type: 'invalid_type')

    post '/api/content', invalid.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert json_response[:errors], 'Expected validation errors'
  end

  def test_create_content_generates_unique_id
    ids = []

    3.times do |i|
      data = @test_content.merge(title: "Post #{i}")
      post '/api/content', data.to_json, 'CONTENT_TYPE' => 'application/json'
      ids << json_response[:item][:id]
    end

    assert_equal ids.uniq.count, ids.count, 'All IDs should be unique'
  end

  # ==========================================================================
  # GET /api/content/:id
  # ==========================================================================

  def test_get_content_by_id
    # Create content first
    post '/api/content', @test_content.to_json, 'CONTENT_TYPE' => 'application/json'
    id = json_response[:item][:id]

    # Get by ID
    get "/api/content/#{id}"

    assert_success
    item = json_response[:item]
    assert_equal id, item[:id]
    assert_equal 'Test Post', item[:title]
  end

  def test_get_content_returns_404_for_missing
    get '/api/content/non-existent-id'

    assert_error(404)
    assert_equal 'content_not_found', json_response[:error]
  end

  # ==========================================================================
  # PUT /api/content/:id
  # ==========================================================================

  def test_update_content_modifies_fields
    # Create content
    post '/api/content', @test_content.to_json, 'CONTENT_TYPE' => 'application/json'
    id = json_response[:item][:id]

    # Update content
    updates = {
      title: 'Updated Title',
      content: 'Updated content text.'
    }

    put "/api/content/#{id}", updates.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    assert_equal 'Content updated', json_response[:message]

    item = json_response[:item]
    assert_equal 'Updated Title', item[:title]
    assert_equal 'Updated content text.', item[:content]
    assert_equal 'post', item[:type] # Type unchanged
    assert item[:updated_at], 'Expected updated_at timestamp'
  end

  def test_update_content_validates_fields
    # Create content
    post '/api/content', @test_content.to_json, 'CONTENT_TYPE' => 'application/json'
    id = json_response[:item][:id]

    # Try invalid update
    updates = { type: 'invalid_type' }

    put "/api/content/#{id}", updates.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(400)
    assert json_response[:errors], 'Expected validation errors'
  end

  def test_update_content_returns_404_for_missing
    put '/api/content/non-existent', {}.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_error(404)
    assert_equal 'content_not_found', json_response[:error]
  end

  def test_update_content_allows_partial_updates
    # Create content
    post '/api/content', @test_content.to_json, 'CONTENT_TYPE' => 'application/json'
    id = json_response[:item][:id]

    # Update only title
    put "/api/content/#{id}", { title: 'New Title' }.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    item = json_response[:item]
    assert_equal 'New Title', item[:title]
    assert_equal 'This is test content.', item[:content] # Unchanged
  end

  # ==========================================================================
  # DELETE /api/content/:id
  # ==========================================================================

  def test_delete_content_removes_item
    # Create content
    post '/api/content', @test_content.to_json, 'CONTENT_TYPE' => 'application/json'
    id = json_response[:item][:id]

    # Delete content
    delete "/api/content/#{id}"

    assert_success
    assert_equal 'Content deleted', json_response[:message]

    # Verify it's gone
    get "/api/content/#{id}"
    assert_error(404)
  end

  def test_delete_content_returns_404_for_missing
    delete '/api/content/non-existent'

    assert_error(404)
    assert_equal 'content_not_found', json_response[:error]
  end

  # ==========================================================================
  # Content Types
  # ==========================================================================

  def test_supports_post_type
    content = @test_content.merge(type: 'post')
    post '/api/content', content.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    assert_equal 'post', json_response[:item][:type]
  end

  def test_supports_page_type
    content = @test_content.merge(type: 'page')
    post '/api/content', content.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    assert_equal 'page', json_response[:item][:type]
  end

  def test_supports_portfolio_type
    content = @test_content.merge(type: 'portfolio')
    post '/api/content', content.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    assert_equal 'portfolio', json_response[:item][:type]
  end

  # ==========================================================================
  # Metadata Support
  # ==========================================================================

  def test_stores_metadata
    content_with_meta = @test_content.merge(
      metadata: {
        author: 'Test Author',
        tags: ['test', 'example'],
        featured: true
      }
    )

    post '/api/content', content_with_meta.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    metadata = json_response[:item][:metadata]
    assert metadata, 'Expected metadata'
    assert_equal 'Test Author', metadata[:author]
    assert_equal ['test', 'example'], metadata[:tags]
    assert_equal true, metadata[:featured]
  end

  def test_updates_metadata
    # Create with metadata
    content = @test_content.merge(metadata: { version: 1 })
    post '/api/content', content.to_json, 'CONTENT_TYPE' => 'application/json'
    id = json_response[:item][:id]

    # Update metadata
    updates = { metadata: { version: 2, revised: true } }
    put "/api/content/#{id}", updates.to_json, 'CONTENT_TYPE' => 'application/json'

    assert_success
    metadata = json_response[:item][:metadata]
    assert_equal 2, metadata[:version]
    assert_equal true, metadata[:revised]
  end
end