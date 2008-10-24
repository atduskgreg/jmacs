require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/documents/edit.html.erb" do
  include DocumentsHelper
  
  before(:each) do
    assigns[:document] = @document = stub_model(Document,
      :new_record? => false
    )
  end

  it "should render edit form" do
    render "/documents/edit.html.erb"
    
    response.should have_tag("form[action=#{document_path(@document)}][method=post]") do
    end
  end
end


